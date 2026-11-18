"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/domain/services/auth.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import {
  createV3Activity,
  getV3ActivityById,
  getV3BankActivities,
  toggleV3ActivityArchive,
} from "@/lib/domain/usecases/v3.usecases/activities/v3_activities.usecase";
import { resolveSilidUserByEmail } from "@/lib/domain/usecases/v3.usecases/classes/get_v3_class_cards_by_school.usecase";
import {
  createV3ClassWorkComponent,
  deleteV3ClassWorkComponent,
  markAllV3NotificationsRead,
  markV3NotificationRead,
  sendV3ClassChatMessage,
  updateV3ClassWorkComponent,
  updateV3ParticipantFlag,
  upsertV3Attendance,
} from "@/lib/domain/usecases/v3.usecases/classes/mutate_v3_class.usecase";
import {
  createV3Course,
  updateV3CourseStatus,
} from "@/lib/domain/usecases/v3.usecases/courses/mutate_v3_courses.usecase";
import { reconcileClassRosterToMysql } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_class_roster.usecase";
import { FRAPPE_COOKIE_NAMES, type FrappeDocResult } from "@/lib/entities/frappe.type";
import { hasPermission, USER_PERMISSION, type UserPermission } from "@/lib/entities/users.type";
import type {
  AttendanceEntry,
  ClassActivityItem,
  ClassCardItem,
  CourseStatus,
  ExternalCourseItem,
} from "@/types/lms";

async function authorize(action: string, permission: UserPermission) {
  const userSession = await auth();
  if (!userSession || userSession.expired) {
    await logAction({
      userId: "anonymous",
      action,
      success: false,
      error: "Authentication required.",
    });
    return { ok: false as const, error: "Authentication required." };
  }
  if (!hasPermission(userSession.user.role, permission)) {
    await logAction({
      userId: userSession.user.id,
      action,
      success: false,
      error: "Not authorized.",
      role: userSession.user.role,
    });
    return { ok: false as const, error: "You are not authorized for this action." };
  }
  const cookieStore = await cookies();
  const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
  const schoolName = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_NAME)?.value ?? "";
  const schoolSite = cookieStore.get(FRAPPE_COOKIE_NAMES.SITE)?.value ?? "";
  const silidUser = await resolveSilidUserByEmail(
    userSession.user.email,
    schoolCode || undefined,
  );
  return {
    ok: true as const,
    userSession,
    silidUser,
    schoolCode,
    schoolName,
    schoolSite,
  };
}

export async function createActivityAction(input: {
  item: Omit<ClassActivityItem, "id" | "submittedCount" | "totalStudents">;
  bank?: boolean;
}): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:activity:create";
  try {
    const gate = await authorize(action, USER_PERMISSION.ACTIVITIES_WRITE);
    if (!gate.ok) return gate;

    const id = await createV3Activity({
      classCardId: input.item.classId || null,
      userId: gate.silidUser?.id ?? null,
      item: input.item,
      bank: input.bank,
    });

    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create activity.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function toggleDeleteActivityAction(input: {
  id: string;
  deleted: boolean;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:activity:archive";
  try {
    const gate = await authorize(action, USER_PERMISSION.ACTIVITIES_WRITE);
    if (!gate.ok) return gate;

    await toggleV3ActivityArchive(input.id, input.deleted);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update activity.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function getActivityPreviewAction(
  activityId: string,
): Promise<FrappeDocResult<ClassActivityItem | null>> {
  const action = "lms:activity:preview";
  try {
    const gate = await authorize(action, USER_PERMISSION.ACTIVITIES_READ);
    if (!gate.ok) return gate;

    const data = await getV3ActivityById(activityId);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch activity.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function getBankActivitiesAction(): Promise<FrappeDocResult<ClassActivityItem[]>> {
  const action = "lms:activity-bank:list";
  try {
    const gate = await authorize(action, USER_PERMISSION.ACTIVITIES_READ);
    if (!gate.ok) return gate;

    const data = await getV3BankActivities();
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load activity bank.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function addComponentAction(input: {
  classCardId: string;
  categoryName: string;
  weightPercent: number;
}): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:component:create";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    const id = await createV3ClassWorkComponent({
      classCardId: input.classCardId,
      name: input.categoryName,
      weightPercent: input.weightPercent,
    });
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add component.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function updateComponentAction(input: {
  id: string;
  classCardId?: string;
  categoryName: string;
  weightPercent: number;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:component:update";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    await updateV3ClassWorkComponent({
      id: input.id,
      classCardId: input.classCardId,
      name: input.categoryName,
      weightPercent: input.weightPercent,
    });
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update component.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function deleteComponentAction(
  id: string,
  classCardId?: string,
): Promise<FrappeDocResult<void>> {
  const action = "lms:component:delete";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    await deleteV3ClassWorkComponent(id, classCardId);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete component.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function toggleMemberFlagAction(input: {
  classCardId: string;
  userId: string;
  enabled?: boolean;
  hasPermit?: boolean;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:member:update";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    await updateV3ParticipantFlag(input);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update participant.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function setAttendanceAction(input: {
  classCardId: string;
  studentId: string;
  status: AttendanceEntry["status"];
}): Promise<FrappeDocResult<void>> {
  const action = "lms:attendance:record";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    await upsertV3Attendance(input);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record attendance.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function sendClassChatAction(input: {
  classCardId: string;
  message: string;
}): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:chat:send";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_READ);
    if (!gate.ok) return gate;

    const id = await sendV3ClassChatMessage({
      classCardId: input.classCardId,
      senderId: gate.silidUser?.id ?? null,
      message: input.message,
    });
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function markNotificationsReadAction(
  notificationId?: string,
): Promise<FrappeDocResult<void>> {
  const action = "lms:notifications:read";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_READ);
    if (!gate.ok) return gate;

    if (notificationId) {
      await markV3NotificationRead(notificationId);
    } else if (gate.silidUser?.id) {
      await markAllV3NotificationsRead(gate.silidUser.id);
    }
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notifications.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function updateCourseStatusAction(input: {
  courseId: string;
  status: CourseStatus;
}): Promise<FrappeDocResult<void>> {
  const action = "lms:course:status";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    await updateV3CourseStatus(input.courseId, input.status);
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update course.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function createCourseAction(
  item: Omit<ExternalCourseItem, "id" | "publishedAt" | "lessons">,
): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:course:create";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    const id = await createV3Course({
      userId: gate.silidUser?.id ?? null,
      item,
    });
    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create course.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function createCustomClassAction(
  item: Omit<ClassCardItem, "id">,
): Promise<FrappeDocResult<{ id: string }>> {
  const action = "lms:class:create";
  try {
    const gate = await authorize(action, USER_PERMISSION.CLASSES_WRITE);
    if (!gate.ok) return gate;

    const reconciled = await reconcileClassRosterToMysql({
      schoolCode: gate.schoolCode || "SILID",
      schoolName: gate.schoolName || "Silid LMS",
      schoolSite: gate.schoolSite || "https://ccs.wela.online",
      sectionName: item.sectionName || "General",
      classroomName: item.sectionName || "General",
      subjectName: item.subjectName,
      subjectCode: item.subjectCode || item.subjectName,
      period: item.schoolYear || "Active Term",
      roster: [
        {
          name: gate.userSession.user.name,
          email: gate.userSession.user.email,
          role: "teacher",
        },
      ],
      reEnableDisabled: true,
    });

    await logAction({
      userId: gate.userSession.user.id,
      action,
      success: true,
      role: gate.userSession.user.role,
    });
    return { ok: true, data: { id: reconciled.classCardId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create class.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}
