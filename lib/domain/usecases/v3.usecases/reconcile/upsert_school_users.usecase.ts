import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, notExists, sql } from "drizzle-orm";
import { classCard, classrooms, participants, schools, users } from "@/drizzle/schema";
import {
  normalizeEmail,
  nowMysqlDatetime,
  parseSilidRole,
  SYNC_CHUNK_SIZE,
  type DrizzleTx,
} from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type {
  ReconcileParticipantInput,
  ReconcileResult,
  ReconcileRole,
} from "@/lib/entities/reconcile.type";

const CLASS_MEMBER_ROLES: ReconcileRole[] = ["student", "teacher", "admin"];

/**
 * Reconciles `users` in MySQL using `silid-v3`'s "one user per email per school" invariant:
 * matches users already linked to `schoolCode` via `participants -> classCard -> classrooms -> schools`,
 * then orphan users with zero participants, inserting missing rows in 200-item chunks.
 */
export async function upsertSchoolUsers(
  tx: DrizzleTx,
  params: {
    schoolCode: string;
    roster: ReconcileParticipantInput[];
    result: ReconcileResult;
    keepExistingRole?: boolean;
  },
): Promise<Map<string, string>> {
  const { schoolCode, roster, result, keepExistingRole = false } = params;
  const emailToUserId = new Map<string, string>();
  const existingByEmail = new Map<
    string,
    { id: string; name: string; role: string; imageUrl: string | null }
  >();
  const emails = roster.map((r) => normalizeEmail(r.email));

  // 1. Existing school-scoped users
  for (let i = 0; i < emails.length; i += SYNC_CHUNK_SIZE) {
    const chunk = emails.slice(i, i + SYNC_CHUNK_SIZE);
    if (chunk.length === 0) continue;

    const existing = await tx
      .selectDistinct({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        imageUrl: users.imageUrl,
      })
      .from(users)
      .innerJoin(participants, eq(participants.userId, users.id))
      .innerJoin(classCard, eq(participants.classCardId, classCard.id))
      .innerJoin(classrooms, eq(classCard.classroomId, classrooms.id))
      .innerJoin(schools, eq(classrooms.schoolId, schools.id))
      .where(and(inArray(users.email, chunk), eq(schools.schoolCode, schoolCode)));

    for (const row of existing) {
      const email = normalizeEmail(row.email);
      if (!existingByEmail.has(email)) {
        emailToUserId.set(email, row.id);
        existingByEmail.set(email, {
          id: row.id,
          name: row.name,
          role: row.role,
          imageUrl: row.imageUrl,
        });
      }
    }
  }

  // 2. Orphan users (belong to no school yet)
  const missingEmails = [...new Set(emails.filter((email) => !existingByEmail.has(email)))];
  for (let i = 0; i < missingEmails.length; i += SYNC_CHUNK_SIZE) {
    const chunk = missingEmails.slice(i, i + SYNC_CHUNK_SIZE);
    if (chunk.length === 0) continue;

    const orphans = await tx
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        imageUrl: users.imageUrl,
      })
      .from(users)
      .where(
        and(
          inArray(users.email, chunk),
          inArray(users.role, CLASS_MEMBER_ROLES),
          notExists(
            tx.select({ one: sql`1` }).from(participants).where(eq(participants.userId, users.id)),
          ),
        ),
      )
      .orderBy(asc(users.createdAt));

    for (const row of orphans) {
      const email = normalizeEmail(row.email);
      if (!existingByEmail.has(email)) {
        emailToUserId.set(email, row.id);
        existingByEmail.set(email, {
          id: row.id,
          name: row.name,
          role: row.role,
          imageUrl: row.imageUrl,
        });
      }
    }
  }

  const now = nowMysqlDatetime();
  const toInsert: (typeof users.$inferInsert)[] = [];

  for (const person of roster) {
    const email = normalizeEmail(person.email);
    const requestedRole = parseSilidRole(person.role);
    const imageUrl = person.imageUrl ?? null;
    const existing = existingByEmail.get(email);

    if (existing) {
      emailToUserId.set(email, existing.id);
      const role = keepExistingRole ? parseSilidRole(existing.role) : requestedRole;
      if (
        existing.name === person.name &&
        existing.role === role &&
        (existing.imageUrl ?? null) === imageUrl
      ) {
        continue;
      }

      await tx
        .update(users)
        .set({ name: person.name, role, imageUrl })
        .where(eq(users.id, existing.id));
      result.usersUpdated += 1;
      continue;
    }

    const id = randomUUID();
    emailToUserId.set(email, id);
    toInsert.push({
      id,
      name: person.name,
      email,
      role: requestedRole,
      imageUrl,
      createdAt: now,
    });
  }

  for (let i = 0; i < toInsert.length; i += SYNC_CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + SYNC_CHUNK_SIZE);
    if (chunk.length > 0) {
      await tx.insert(users).values(chunk);
      result.usersCreated += chunk.length;
    }
  }

  return emailToUserId;
}
