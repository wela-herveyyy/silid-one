import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import { dataMigration } from "@/drizzle/schema";
import { extractV2ClassMetadataAndRoster } from "@/lib/domain/usecases/v2.usecases/classes/extract_v2_class_payload.usecase";
import { getV2ClassesWithRawDocs } from "@/lib/domain/usecases/v2.usecases/classes/get_v2_classes.usecase";
import { reconcileClassRosterToMysql } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_class_roster.usecase";
import { nowMysqlDatetime } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";

export type MigrateV2Summary = {
  migratedClasses: number;
  usersCreated: number;
  participantsInserted: number;
};

/**
 * Pulls full V2 `"Class"` documents (teachers, schedules, and student rosters) from a V2 Frappe site
 * using `Cookie: sid=...`, reconciles them into Silid V3 MySQL tables (`schools -> departments -> sections
 * -> subjects -> classrooms -> class_card -> users -> participants`), and logs provenance in `data_migration`.
 */
export async function migrateV2ClassesToMysql(input: {
  baseUrl: string;
  sid: string;
  schoolCode: string;
  schoolName: string;
  sessionUserName: string;
  sessionUserEmail: string;
  sessionUserRole: "teacher" | "admin" | "student";
}): Promise<MigrateV2Summary> {
  const fullRes = await getV2ClassesWithRawDocs({
    baseUrl: input.baseUrl,
    sid: input.sid,
    email: input.sessionUserEmail,
  });

  if (!fullRes.ok || fullRes.data.length === 0) {
    return { migratedClasses: 0, usersCreated: 0, participantsInserted: 0 };
  }

  let migratedClasses = 0;
  let usersCreated = 0;
  let participantsInserted = 0;

  for (const entry of fullRes.data) {
    const meta = extractV2ClassMetadataAndRoster(entry.rawDoc, input.schoolCode, [
      {
        name: input.sessionUserName,
        email: input.sessionUserEmail,
        role: input.sessionUserRole,
      },
    ]);

    const res = await reconcileClassRosterToMysql({
      schoolCode: input.schoolCode,
      schoolName: input.schoolName,
      schoolSite: input.baseUrl,
      departmentName: meta.departmentName,
      sectionName: meta.sectionName,
      level: meta.level,
      classroomName: meta.sectionName,
      subjectName: entry.card.subjectName,
      subjectCode: entry.card.subjectCode,
      period: entry.card.schoolYear || "Active Term",
      roster: meta.roster,
      allowedTeacherEmails: meta.allowedTeacherEmails,
      rosterComplete: true,
      reEnableDisabled: true,
      keepExistingRole: true,
    });

    migratedClasses += 1;
    usersCreated += res.usersCreated;
    participantsInserted += res.participantsInserted;

    // Record idempotent provenance row in `data_migration` matching silid-v3's ImportClassManagementUseCase
    const v2Id = entry.card.doctypeName || entry.card.id;
    const existingMig = await database
      .select({ id: dataMigration.id })
      .from(dataMigration)
      .where(and(eq(dataMigration.schoolId, res.schoolId), eq(dataMigration.dataId, v2Id)))
      .limit(1);

    const now = nowMysqlDatetime();
    if (!existingMig[0]) {
      await database.insert(dataMigration).values({
        id: randomUUID(),
        schoolId: res.schoolId,
        dataId: v2Id,
        data: {
          v2Id,
          v2Path: "Class",
          classCardId: res.classCardId,
          studentCount: meta.studentCount,
          source: "v2",
          syncedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await database
        .update(dataMigration)
        .set({
          data: {
            v2Id,
            v2Path: "Class",
            classCardId: res.classCardId,
            studentCount: meta.studentCount,
            source: "v2",
            syncedAt: now,
          },
          updatedAt: now,
        })
        .where(eq(dataMigration.id, existingMig[0].id));
    }
  }

  updateTag("classes");
  updateTag("members");
  return { migratedClasses, usersCreated, participantsInserted };
}
