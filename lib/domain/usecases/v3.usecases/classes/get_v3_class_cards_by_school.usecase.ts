import { and, desc, eq, inArray } from "drizzle-orm";
import { database } from "@/database";
import {
  classCard,
  classrooms,
  departments,
  participants,
  schools,
  sections,
  subjects,
  users,
} from "@/drizzle/schema";
import { normalizeEmail } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type { ClassCardItem } from "@/types/lms";

/**
 * Resolves a Silid V3 `users.id` scoped to `schoolCode` (or matching email).
 */
export async function resolveSilidUserByEmail(
  email: string,
  schoolCode?: string,
): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  if (schoolCode) {
    const scoped = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .innerJoin(participants, eq(participants.userId, users.id))
      .innerJoin(classCard, eq(participants.classCardId, classCard.id))
      .innerJoin(classrooms, eq(classCard.classroomId, classrooms.id))
      .innerJoin(schools, eq(classrooms.schoolId, schools.id))
      .where(and(eq(users.email, cleanEmail), eq(schools.schoolCode, schoolCode)))
      .limit(1);

    if (scoped[0]) return scoped[0];
  }

  const fallback = await database
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  return fallback[0] ?? null;
}

/**
 * Queries Silid V3 `class_card` records from MySQL (`silid-v3` `GetClassCardsViewByUserIdAndSchoolCodeUseCase` basis).
 */
export async function getV3ClassCardsFromMysql(params: {
  schoolCode?: string;
  userId?: string;
  isAdmin?: boolean;
  includeArchived?: boolean;
}): Promise<ClassCardItem[]> {
  try {
    const conditions = [];
    if (!params.includeArchived) {
      conditions.push(eq(classCard.archive, 0));
    }
    if (params.schoolCode) {
      conditions.push(eq(schools.schoolCode, params.schoolCode));
    }

    const baseQuery = database
      .selectDistinct({
        id: classCard.id,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        sectionName: sections.name,
        level: sections.level,
        classroomName: classrooms.name,
        period: classCard.period,
        semester: classCard.semester,
        color: classCard.color,
        archive: classCard.archive,
        createdAt: classCard.createdAt,
      })
      .from(classCard)
      .innerJoin(classrooms, eq(classCard.classroomId, classrooms.id))
      .innerJoin(schools, eq(classrooms.schoolId, schools.id))
      .leftJoin(subjects, eq(classCard.subjectId, subjects.id))
      .leftJoin(sections, eq(classCard.sectionId, sections.id))
      .leftJoin(departments, eq(sections.departmentId, departments.id));

    const rows =
      !params.isAdmin && params.userId
        ? await baseQuery
            .innerJoin(participants, eq(participants.classCardId, classCard.id))
            .where(
              and(
                ...conditions,
                eq(participants.userId, params.userId),
                eq(participants.enabled, 1),
              ),
            )
            .orderBy(desc(classCard.createdAt))
            .limit(60)
        : conditions.length > 0
          ? await baseQuery
              .where(and(...conditions))
              .orderBy(desc(classCard.createdAt))
              .limit(60)
          : await baseQuery.orderBy(desc(classCard.createdAt)).limit(60);

    if (rows.length === 0) return [];

    // Hydrate participant counts & lead teacher name in one batched query
    const cardIds = rows.map((r) => r.id);
    const memberRows = await database
      .select({
        classCardId: participants.classCardId,
        userName: users.name,
        userRole: users.role,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(and(inArray(participants.classCardId, cardIds), eq(participants.enabled, 1)));

    const statsByCard = new Map<string, { studentCount: number; teacherName: string }>();
    for (const m of memberRows) {
      const curr = statsByCard.get(m.classCardId) ?? { studentCount: 0, teacherName: "" };
      if (m.userRole === "student") {
        curr.studentCount += 1;
      } else if (!curr.teacherName && (m.userRole === "teacher" || m.userRole === "admin")) {
        curr.teacherName = m.userName;
      }
      statsByCard.set(m.classCardId, curr);
    }

    return rows.map((r) => {
      const stats = statsByCard.get(r.id);
      return {
        id: r.id,
        subjectName: r.subjectName || r.classroomName || "Untitled Subject",
        subjectCode: r.subjectCode || "SUBJ",
        sectionName: r.sectionName || r.classroomName || "General Section",
        schoolYear: r.period || r.semester || "Active Term",
        teacherName: stats?.teacherName || "Assigned Teacher",
        schedule: r.classroomName || r.level || "Silid V3",
        studentCount: stats?.studentCount ?? 0,
        kind: "sms",
        accentColor: r.color || "#ea580c",
        archived: Boolean(r.archive),
      };
    });
  } catch (error) {
    console.error("[getV3ClassCardsFromMysql]", error);
    return [];
  }
}
