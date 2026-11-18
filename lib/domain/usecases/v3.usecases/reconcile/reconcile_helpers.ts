import type { database } from "@/database";
import type {
  ReconcileClassInput,
  ReconcileParticipantInput,
  ReconcileRole,
} from "@/lib/entities/reconcile.type";

export const SYNC_CHUNK_SIZE = 200;
export const LARGE_ROSTER_UPSERT_ONLY_MIN = 500;

export type DrizzleTx = Parameters<Parameters<typeof database.transaction>[0]>[0];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseSilidRole(role: string): ReconcileRole {
  const normalized = role.trim().toLowerCase();
  if (normalized === "teacher") return "teacher";
  if (normalized === "admin" || normalized === "owner") return "admin";
  return "student";
}

export function nowMysqlDatetime(): string {
  return new Date().toISOString().slice(0, 23).replace("T", " ");
}

export function mysqlAffectedRows(result: unknown): number {
  if (!result) return 0;
  if (Array.isArray(result) && result[0] && typeof result[0] === "object") {
    const header = result[0] as { affectedRows?: number };
    return Number(header.affectedRows ?? 0);
  }
  if (typeof result === "object") {
    const header = result as { affectedRows?: number };
    return Number(header.affectedRows ?? 0);
  }
  return 0;
}

export function dedupeRosterByEmail(
  rows: ReconcileParticipantInput[],
): ReconcileParticipantInput[] {
  const byEmail = new Map<string, ReconcileParticipantInput>();
  for (const row of rows) {
    const email = normalizeEmail(row.email);
    if (!email) continue;
    if (!byEmail.has(email)) {
      byEmail.set(email, { ...row, email });
    }
  }
  return [...byEmail.values()];
}

/**
 * Disables absent students only when roster is complete and under the 500-row safety ceiling
 * (matching `silid-v3/src/services/usecases/participants/sync-classroom.helpers.ts`).
 */
export function shouldDisableStaleStudents(
  rosterLength: number,
  input: Pick<ReconcileClassInput, "expectedParticipantCount" | "rosterComplete">,
): boolean {
  const expected = input.expectedParticipantCount ?? rosterLength;
  if (expected >= LARGE_ROSTER_UPSERT_ONLY_MIN || rosterLength >= LARGE_ROSTER_UPSERT_ONLY_MIN) {
    return false;
  }
  if (input.rosterComplete === false) return false;
  if (input.rosterComplete === true) return true;
  if (input.expectedParticipantCount != null) {
    return rosterLength >= input.expectedParticipantCount;
  }
  return false;
}
