import { randomUUID } from "node:crypto";
import { and, eq, inArray, notInArray, type SQL } from "drizzle-orm";
import { participants, users } from "@/drizzle/schema";
import {
  mysqlAffectedRows,
  normalizeEmail,
  nowMysqlDatetime,
  parseSilidRole,
  SYNC_CHUNK_SIZE,
  type DrizzleTx,
} from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type { ReconcileParticipantInput, ReconcileResult } from "@/lib/entities/reconcile.type";

/**
 * Idempotently reconciles `participants` rows on one `class_card` in MySQL:
 * inserts missing members, re-enables disabled rows (preserving manual student switch-offs
 * when `reEnableDisabled` is false), and disables stale students/teachers when allowed.
 */
export async function syncClassCardParticipants(
  tx: DrizzleTx,
  params: {
    classCardId: string;
    roster: ReconcileParticipantInput[];
    emailToUserId: Map<string, string>;
    disableStale: boolean;
    reEnableDisabled: boolean;
    allowedTeacherEmails?: string[];
    disableEmails?: string[];
    result: ReconcileResult;
  },
): Promise<void> {
  const {
    classCardId,
    roster,
    emailToUserId,
    disableStale,
    reEnableDisabled,
    allowedTeacherEmails,
    disableEmails = [],
    result,
  } = params;

  const existingRows = await tx
    .select({
      id: participants.id,
      userId: participants.userId,
      enabled: participants.enabled,
    })
    .from(participants)
    .where(eq(participants.classCardId, classCardId));

  const participantByUserId = new Map<string, { id: string; enabled: number }>();
  for (const row of existingRows) {
    const prev = participantByUserId.get(row.userId);
    if (!prev || row.enabled === 1) {
      participantByUserId.set(row.userId, { id: row.id, enabled: row.enabled });
    }
  }

  const now = nowMysqlDatetime();
  const toInsert: (typeof participants.$inferInsert)[] = [];
  const toEnableIds: string[] = [];
  const allowedStudentUserIds = new Set<string>();

  for (const person of roster) {
    const email = normalizeEmail(person.email);
    const userId = emailToUserId.get(email);
    if (!userId) continue;

    const role = parseSilidRole(person.role);
    if (role === "student") {
      allowedStudentUserIds.add(userId);
    }

    const existing = participantByUserId.get(userId);
    if (!existing) {
      toInsert.push({
        id: randomUUID(),
        userId,
        classCardId,
        enabled: 1,
        hasPermit: 1,
        createdAt: now,
        updatedAt: now,
      });
      continue;
    }

    if (existing.enabled === 0 && (reEnableDisabled || role !== "student")) {
      toEnableIds.push(existing.id);
    }
  }

  for (let i = 0; i < toInsert.length; i += SYNC_CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + SYNC_CHUNK_SIZE);
    if (chunk.length > 0) {
      await tx.insert(participants).values(chunk);
      result.participantsInserted += chunk.length;
    }
  }

  for (let i = 0; i < toEnableIds.length; i += SYNC_CHUNK_SIZE) {
    const chunk = toEnableIds.slice(i, i + SYNC_CHUNK_SIZE);
    if (chunk.length > 0) {
      const updateRes = await tx
        .update(participants)
        .set({ enabled: 1, updatedAt: now })
        .where(and(inArray(participants.id, chunk), eq(participants.enabled, 0)));
      result.participantsEnabled += mysqlAffectedRows(updateRes);
    }
  }

  if (disableStale) {
    const staleConditions: SQL[] = [
      eq(participants.classCardId, classCardId),
      eq(participants.enabled, 1),
      eq(users.role, "student"),
    ];
    if (allowedStudentUserIds.size > 0) {
      staleConditions.push(notInArray(participants.userId, [...allowedStudentUserIds]));
    }

    const staleRows = await tx
      .select({ id: participants.id })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(and(...staleConditions));

    const ids = staleRows.map((r) => r.id);
    for (let i = 0; i < ids.length; i += SYNC_CHUNK_SIZE) {
      const chunk = ids.slice(i, i + SYNC_CHUNK_SIZE);
      if (chunk.length > 0) {
        const res = await tx
          .update(participants)
          .set({ enabled: 0, updatedAt: now })
          .where(inArray(participants.id, chunk));
        result.participantsDisabled += mysqlAffectedRows(res);
      }
    }
  }

  if (allowedTeacherEmails && allowedTeacherEmails.length > 0) {
    const cleanAllowed = allowedTeacherEmails.map(normalizeEmail).filter(Boolean);
    if (cleanAllowed.length > 0) {
      const staleTeachers = await tx
        .select({ id: participants.id })
        .from(participants)
        .innerJoin(users, eq(participants.userId, users.id))
        .where(
          and(
            eq(participants.classCardId, classCardId),
            eq(participants.enabled, 1),
            eq(users.role, "teacher"),
            notInArray(users.email, cleanAllowed),
          ),
        );

      const ids = staleTeachers.map((r) => r.id);
      for (let i = 0; i < ids.length; i += SYNC_CHUNK_SIZE) {
        const chunk = ids.slice(i, i + SYNC_CHUNK_SIZE);
        const res = await tx
          .update(participants)
          .set({ enabled: 0, updatedAt: now })
          .where(inArray(participants.id, chunk));
        result.participantsDisabled += mysqlAffectedRows(res);
      }
    }
  }

  const cleanDisable = [...new Set(disableEmails.map(normalizeEmail).filter(Boolean))];
  if (cleanDisable.length > 0) {
    const targetRows = await tx
      .select({ id: participants.id })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(
        and(
          eq(participants.classCardId, classCardId),
          eq(participants.enabled, 1),
          inArray(users.email, cleanDisable),
        ),
      );
    const ids = targetRows.map((r) => r.id);
    for (let i = 0; i < ids.length; i += SYNC_CHUNK_SIZE) {
      const chunk = ids.slice(i, i + SYNC_CHUNK_SIZE);
      const res = await tx
        .update(participants)
        .set({ enabled: 0, updatedAt: now })
        .where(inArray(participants.id, chunk));
      result.participantsDisabled += mysqlAffectedRows(res);
    }
  }
}
