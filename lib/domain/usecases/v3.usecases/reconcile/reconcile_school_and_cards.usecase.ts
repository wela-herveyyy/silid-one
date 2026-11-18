import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import {
  classCard,
  classrooms,
  departments,
  schools,
  sections,
  subjects,
} from "@/drizzle/schema";
import {
  nowMysqlDatetime,
  type DrizzleTx,
} from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type { ReconcileClassInput } from "@/lib/entities/reconcile.type";

export type ReconciledCardGraph = {
  schoolId: string;
  classroomId: string;
  classCardId: string;
};

/**
 * Resolves or provisions `schools -> departments -> sections -> subjects -> classrooms -> class_card`
 * inside a MySQL transaction, matching `silid-v3`'s `CreateOrUpdateClassCardsUseCase`.
 */
export async function reconcileSchoolAndClassCard(
  tx: DrizzleTx,
  input: ReconcileClassInput,
): Promise<ReconciledCardGraph> {
  const now = nowMysqlDatetime();
  const cleanCode = input.schoolCode.trim();
  const cleanSite = (input.schoolSite || "").trim();

  // 1. Resolve or create school row
  let schoolRow = await tx
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.schoolCode, cleanCode))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!schoolRow && cleanSite) {
    schoolRow = await tx
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.site, cleanSite))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  if (!schoolRow) {
    const newSchoolId = randomUUID();
    await tx.insert(schools).values({
      id: newSchoolId,
      name: (input.schoolName || cleanCode).trim(),
      schoolCode: cleanCode,
      site: cleanSite || "https://ccs.wela.online",
      createdAt: now,
      updatedAt: now,
    });
    schoolRow = { id: newSchoolId };
  }

  // 2. Department
  const deptName = (input.departmentName || "General Department").trim();
  let deptRow = await tx
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.name, deptName))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!deptRow) {
    const id = randomUUID();
    await tx.insert(departments).values({
      id,
      name: deptName,
      createdAt: now,
      updatedAt: now,
    });
    deptRow = { id };
  }

  // 3. Section (note: pulled Drizzle schema marks `sections.updatedAt` NOT NULL with no default)
  const sectionName = input.sectionName.trim();
  const levelName = (input.level || "General").trim();
  let sectionRow = await tx
    .select({ id: sections.id })
    .from(sections)
    .where(and(eq(sections.name, sectionName), eq(sections.departmentId, deptRow.id)))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!sectionRow) {
    const id = randomUUID();
    await tx.insert(sections).values({
      id,
      name: sectionName,
      level: levelName,
      departmentId: deptRow.id,
      createdAt: now,
      updatedAt: now,
    });
    sectionRow = { id };
  }

  // 4. Subject
  const subjectCode = input.subjectCode.trim();
  const subjectName = input.subjectName.trim();
  let subjectRow = await tx
    .select({ id: subjects.id })
    .from(subjects)
    .where(and(eq(subjects.code, subjectCode), eq(subjects.name, subjectName)))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!subjectRow) {
    const id = randomUUID();
    await tx.insert(subjects).values({
      id,
      name: subjectName,
      code: subjectCode,
      createdAt: now,
      updatedAt: now,
    });
    subjectRow = { id };
  }

  // 5. Classroom scoped by schoolId
  const classroomName = (input.classroomName || sectionName).trim();
  let classroomRow = await tx
    .select({ id: classrooms.id })
    .from(classrooms)
    .where(and(eq(classrooms.schoolId, schoolRow.id), eq(classrooms.name, classroomName)))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!classroomRow) {
    const id = randomUUID();
    await tx.insert(classrooms).values({
      id,
      name: classroomName,
      sectionId: sectionRow.id,
      schoolId: schoolRow.id,
      createdAt: now,
      updatedAt: now,
    });
    classroomRow = { id };
  }

  // 6. ClassCard (active first, archived fallback -> unarchive, else create)
  let cardRow = await tx
    .select({ id: classCard.id, archive: classCard.archive })
    .from(classCard)
    .where(
      and(
        eq(classCard.classroomId, classroomRow.id),
        eq(classCard.subjectId, subjectRow.id),
        eq(classCard.archive, 0),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!cardRow) {
    cardRow = await tx
      .select({ id: classCard.id, archive: classCard.archive })
      .from(classCard)
      .where(and(eq(classCard.classroomId, classroomRow.id), eq(classCard.subjectId, subjectRow.id)))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  if (cardRow && cardRow.archive === 1) {
    await tx
      .update(classCard)
      .set({ archive: 0, updatedAt: now })
      .where(eq(classCard.id, cardRow.id));
  }

  if (!cardRow) {
    const id = randomUUID();
    await tx.insert(classCard).values({
      id,
      sectionId: sectionRow.id,
      classroomId: classroomRow.id,
      subjectId: subjectRow.id,
      period: (input.period || "Active Term").trim(),
      createdAt: now,
      updatedAt: now,
    });
    cardRow = { id, archive: 0 };
  } else {
    // Touch updatedAt for observability when reconciled
    await tx
      .update(classCard)
      .set({ updatedAt: sql`NOW(3)` })
      .where(eq(classCard.id, cardRow.id));
  }

  return {
    schoolId: schoolRow.id,
    classroomId: classroomRow.id,
    classCardId: cardRow.id,
  };
}
