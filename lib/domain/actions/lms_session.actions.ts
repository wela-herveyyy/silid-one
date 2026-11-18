"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { database } from "@/database";
import { classCard, classrooms, dataMigration, schools, sections, subjects } from "@/drizzle/schema";
import { auth } from "@/lib/domain/services/auth.service";
import { getFrappeClasses, getFrappeDoc } from "@/lib/domain/services/frappe.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import { updateClassAppearance } from "@/lib/domain/usecases/classes/update_class.usecase";
import {
  extractV2ClassMetadataAndRoster,
  type RawV2ClassDoc,
} from "@/lib/domain/usecases/v2.usecases/classes/extract_v2_class_payload.usecase";
import { migrateV2ClassesToMysql } from "@/lib/domain/usecases/v2.usecases/reconcile/migrate_v2_classes_to_mysql.usecase";
import { getV3BankActivities } from "@/lib/domain/usecases/v3.usecases/activities/v3_activities.usecase";
import {
  getV3ClassCardsFromMysql,
  resolveSilidUserByEmail,
} from "@/lib/domain/usecases/v3.usecases/classes/get_v3_class_cards_by_school.usecase";
import { getV3ClassWorkspaceBundle } from "@/lib/domain/usecases/v3.usecases/classes/get_v3_class_workspace.usecase";
import {
  createV3Post,
  createV3PostComment,
  getV3NotificationsForUser,
  toggleV3ClassArchive,
} from "@/lib/domain/usecases/v3.usecases/classes/mutate_v3_class.usecase";
import { getV3CoursesFromMysql } from "@/lib/domain/usecases/v3.usecases/courses/get_v3_courses.usecase";
import { reconcileClassRosterToMysql } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_class_roster.usecase";
import {
  FRAPPE_COOKIE_NAMES,
  type FrappeDocResult,
  type SchoolVersion,
} from "@/lib/entities/frappe.type";
import { hasPermission, USER_PERMISSION } from "@/lib/entities/users.type";
import type {
  AttendanceEntry,
  ChatMessageItem,
  ClassActivityItem,
  ClassCardItem,
  ClassMemberItem,
  ClassPostItem,
  ClassworkComponentItem,
  ExternalCourseItem,
  NotificationItem,
  SubmissionScoreRow,
  UserRole,
} from "@/types/lms";

export type LiveSessionState = {
  user: {
    name: string;
    email: string;
    schoolName: string;
  };
  role: UserRole;
  connected: boolean;
  schoolName: string;
  schoolCode: string;
  schoolSite: string;
  schoolVersion: SchoolVersion;
  classes: ClassCardItem[];
  courses: ExternalCourseItem[];
  notifications: NotificationItem[];
  bankActivities: ClassActivityItem[];
  sourceError?: string;
};

export type ClassWorkspaceData = {
  posts: ClassPostItem[];
  activities: ClassActivityItem[];
  components: ClassworkComponentItem[];
  members: ClassMemberItem[];
  attendance: AttendanceEntry[];
  submissions: SubmissionScoreRow[];
  classChat: ChatMessageItem[];
};

function parseSchoolVersion(raw: string | undefined): SchoolVersion {
  if (raw === "v1" || raw === "v2" || raw === "v3") return raw;
  return "v2";
}

function mapAppRole(rawRole: string, email: string): UserRole {
  const normalized = (rawRole || "").trim().toLowerCase();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (normalized === "owner" || normalized === "admin" || cleanEmail.startsWith("administrator@")) {
    return "Admin";
  }
  if (normalized === "student") return "Student";
  if (normalized === "partner") return "Partner";
  return "Teacher";
}

function toReconcileRole(appRole: UserRole): "student" | "teacher" | "admin" {
  if (appRole === "Admin") return "admin";
  if (appRole === "Student") return "student";
  return "teacher";
}

function toPostUserType(appRole: UserRole): "student" | "teacher" | "admin" | "partner" {
  if (appRole === "Student") return "student";
  if (appRole === "Admin") return "admin";
  if (appRole === "Partner") return "partner";
  return "teacher";
}

export async function getLiveSessionStateAction(
  options: { forceSync?: boolean } = {},
): Promise<FrappeDocResult<LiveSessionState>> {
  const action = "lms:session:bootstrap";

  try {
    // 1. Authentication
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({
        userId: "anonymous",
        action,
        success: false,
        error: "Authentication required.",
      });
      return { ok: false, error: "Authentication required." };
    }

    // 2. Authorization
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized." };
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get(FRAPPE_COOKIE_NAMES.SID)?.value ?? "";
    const site = cookieStore.get(FRAPPE_COOKIE_NAMES.SITE)?.value ?? "";
    const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
    const schoolName = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_NAME)?.value ?? "";
    const schoolVersion = parseSchoolVersion(
      cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION)?.value,
    );

    const role = mapAppRole(userSession.user.role, userSession.user.email);
    const resolvedSchool = schoolName || site || "Silid LMS";
    const isAdmin = role === "Admin";

    const [initialSilidUser, courses, bankActivities] = await Promise.all([
      resolveSilidUserByEmail(userSession.user.email, schoolCode || undefined),
      getV3CoursesFromMysql(),
      getV3BankActivities(),
    ]);

    let silidUser = initialSilidUser;
    let dbClasses = await getV3ClassCardsFromMysql({
      schoolCode: schoolCode || undefined,
      userId: silidUser?.id,
      isAdmin,
      includeArchived: true,
    });

    let sourceError: string | undefined;

    let needsV2Migration = false;
    if (sid && site && schoolCode && schoolVersion === "v2" && !options.forceSync) {
      const existingMig = await database
        .select({ id: dataMigration.id })
        .from(dataMigration)
        .innerJoin(schools, eq(dataMigration.schoolId, schools.id))
        .where(eq(schools.schoolCode, schoolCode))
        .limit(1);
      needsV2Migration = existingMig.length === 0;
    }

    if (sid && site && (options.forceSync || dbClasses.length === 0 || needsV2Migration)) {
      if (schoolVersion === "v2" && schoolCode) {
        const migSummary = await migrateV2ClassesToMysql({
          baseUrl: site,
          sid,
          schoolCode,
          schoolName: resolvedSchool,
          sessionUserName: userSession.user.name,
          sessionUserEmail: userSession.user.email,
          sessionUserRole: toReconcileRole(role),
        });
        if (migSummary.migratedClasses > 0) {
          silidUser = await resolveSilidUserByEmail(userSession.user.email, schoolCode);
          dbClasses = await getV3ClassCardsFromMysql({
            schoolCode,
            userId: silidUser?.id,
            isAdmin,
            includeArchived: true,
          });
        }
      } else {
        const frappeRes = await getFrappeClasses({
          baseUrl: site,
          sid,
          email: userSession.user.email,
          version: schoolVersion,
        });

        if (!frappeRes.ok) {
          sourceError = frappeRes.error;
        } else if (frappeRes.data.length > 0 && schoolCode) {
          for (const fc of frappeRes.data.slice(0, 15)) {
            await reconcileClassRosterToMysql({
              schoolCode,
              schoolName: resolvedSchool,
              schoolSite: site,
              sectionName: fc.sectionName || fc.subjectName,
              classroomName: fc.sectionName || fc.subjectName,
              subjectName: fc.subjectName,
              subjectCode: fc.subjectCode,
              period: fc.schoolYear || "Active Term",
              roster: [
                {
                  name: userSession.user.name,
                  email: userSession.user.email,
                  role: toReconcileRole(role),
                },
              ],
              reEnableDisabled: true,
              keepExistingRole: true,
            });
          }

          silidUser = await resolveSilidUserByEmail(userSession.user.email, schoolCode);
          dbClasses = await getV3ClassCardsFromMysql({
            schoolCode,
            userId: silidUser?.id,
            isAdmin,
            includeArchived: true,
          });
        }
      }
    }

    const notifications = await getV3NotificationsForUser(silidUser?.id);

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return {
      ok: true,
      data: {
        user: {
          name: silidUser?.name || userSession.user.name,
          email: silidUser?.email || userSession.user.email,
          schoolName: resolvedSchool,
        },
        role,
        connected: Boolean(sid && site),
        schoolName: resolvedSchool,
        schoolCode,
        schoolSite: site,
        schoolVersion,
        classes: dbClasses,
        courses,
        notifications,
        bankActivities,
        sourceError,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load LMS session.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function getClassWorkspaceDataAction(
  classCardId: string,
): Promise<FrappeDocResult<ClassWorkspaceData>> {
  const action = "lms:class:workspace:get";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({
        userId: "anonymous",
        action,
        success: false,
        error: "Authentication required.",
      });
      return { ok: false, error: "Authentication required." };
    }

    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized." };
    }

    const bundle = await getV3ClassWorkspaceBundle(classCardId, userSession.user.email);

    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: bundle };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load class workspace.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function createClassPostAction(input: {
  classCardId: string;
  message: string;
}): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:post:create";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({ userId: "anonymous", action, success: false, error: "Auth required." });
      return { ok: false, error: "Authentication required." };
    }
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized." };
    }

    const cookieStore = await cookies();
    const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
    const silidUser = await resolveSilidUserByEmail(
      userSession.user.email,
      schoolCode || undefined,
    );
    const appRole = mapAppRole(userSession.user.role, userSession.user.email);

    const id = await createV3Post({
      classCardId: input.classCardId,
      userId: silidUser?.id ?? null,
      role: toPostUserType(appRole),
      message: input.message,
    });

    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish post.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function createPostCommentAction(input: {
  postId: string;
  message: string;
}): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:post:comment:create";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({ userId: "anonymous", action, success: false, error: "Auth required." });
      return { ok: false, error: "Authentication required." };
    }
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized." };
    }

    const cookieStore = await cookies();
    const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
    const silidUser = await resolveSilidUserByEmail(
      userSession.user.email,
      schoolCode || undefined,
    );

    const id = await createV3PostComment({
      postId: input.postId,
      userId: silidUser?.id ?? null,
      message: input.message,
    });

    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add comment.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function toggleClassArchiveAction(input: {
  classCardId: string;
  archive: boolean;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:class:archive";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({ userId: "anonymous", action, success: false, error: "Auth required." });
      return { ok: false, error: "Authentication required." };
    }
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_WRITE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized to archive classes." };
    }

    const res = await toggleV3ClassArchive(input.classCardId, input.archive);
    await logAction({
      userId: userSession.user.id,
      action,
      success: res.ok,
      error: res.ok ? undefined : res.error,
      role: userSession.user.role,
    });

    return res.ok ? { ok: true, data: undefined } : { ok: false, error: res.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle archive.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function updateClassAppearanceAction(input: {
  classCardId: string;
  color?: string;
  archive?: boolean;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:class:update";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({ userId: "anonymous", action, success: false, error: "Auth required." });
      return { ok: false, error: "Authentication required." };
    }
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_WRITE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized to update class." };
    }

    const res = await updateClassAppearance({
      id: input.classCardId,
      color: input.color,
      archive: input.archive,
    });
    await logAction({
      userId: userSession.user.id,
      action,
      success: res.ok,
      error: res.ok ? undefined : res.error,
      role: userSession.user.role,
    });
    return res.ok ? { ok: true, data: undefined } : { ok: false, error: res.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update class.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

type RawRosterDoc = {
  section?: string;
  school_year?: string;
  adviser?: string;
  students?: Array<{ student?: string; student_name?: string; email?: string }>;
  instructors?: Array<{ instructor?: string; instructor_name?: string }>;
};

export async function syncClassRosterFromFrappeAction(
  classCardId: string,
): Promise<FrappeDocResult<ClassWorkspaceData>> {
  const action = "lms:class:roster:sync";

  try {
    const userSession = await auth();
    if (!userSession || userSession.expired) {
      await logAction({ userId: "anonymous", action, success: false, error: "Auth required." });
      return { ok: false, error: "Authentication required." };
    }
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "Not authorized." };
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get(FRAPPE_COOKIE_NAMES.SID)?.value ?? "";
    const site = cookieStore.get(FRAPPE_COOKIE_NAMES.SITE)?.value ?? "";
    const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
    const schoolName = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_NAME)?.value ?? "";
    const version = parseSchoolVersion(cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION)?.value);

    const cardRows = await database
      .select({
        sectionName: sections.name,
        classroomName: classrooms.name,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        period: classCard.period,
      })
      .from(classCard)
      .innerJoin(classrooms, eq(classCard.classroomId, classrooms.id))
      .leftJoin(sections, eq(classCard.sectionId, sections.id))
      .leftJoin(subjects, eq(classCard.subjectId, subjects.id))
      .where(eq(classCard.id, classCardId))
      .limit(1);

    const card = cardRows[0];
    if (card && sid && site && schoolCode) {
      const candidateNames = [card.subjectCode, card.classroomName, card.sectionName].filter(
        (v): v is string => Boolean(v && v.trim()),
      );
      const docTypes = version === "v3" ? ["Student Group", "Class"] : ["Class", "Student Group"];

      let docData: RawRosterDoc | null = null;
      outer: for (const doctype of docTypes) {
        for (const docName of candidateNames) {
          const res = await getFrappeDoc<RawRosterDoc>({
            baseUrl: site,
            sid,
            doctype,
            name: docName,
            version,
          });
          if (res.ok) {
            docData = res.data;
            break outer;
          }
        }
      }

      if (docData) {
        const v2Meta = extractV2ClassMetadataAndRoster(
          docData as unknown as RawV2ClassDoc,
          schoolCode,
          [
            {
              name: userSession.user.name,
              email: userSession.user.email,
              role: toReconcileRole(mapAppRole(userSession.user.role, userSession.user.email)),
            },
          ],
        );

        if (v2Meta.roster.length > 0) {
          await reconcileClassRosterToMysql({
            schoolCode,
            schoolName: schoolName || schoolCode,
            schoolSite: site,
            departmentName: v2Meta.departmentName,
            sectionName: card.sectionName || v2Meta.sectionName,
            level: v2Meta.level,
            classroomName: card.classroomName || v2Meta.sectionName,
            subjectName: card.subjectName || "Subject",
            subjectCode: card.subjectCode || "SUBJ",
            period: card.period,
            roster: v2Meta.roster,
            allowedTeacherEmails: v2Meta.allowedTeacherEmails,
            rosterComplete: true,
            reEnableDisabled: true,
          });
        }
      }
    }

    const bundle = await getV3ClassWorkspaceBundle(classCardId, userSession.user.email);

    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: bundle };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync class roster.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}
