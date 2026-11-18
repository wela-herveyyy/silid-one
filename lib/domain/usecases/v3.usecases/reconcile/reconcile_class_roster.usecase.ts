import { database } from "@/database";
import {
  dedupeRosterByEmail,
  shouldDisableStaleStudents,
} from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import { reconcileSchoolAndClassCard } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_school_and_cards.usecase";
import { syncClassCardParticipants } from "@/lib/domain/usecases/v3.usecases/reconcile/sync_class_card_participants.usecase";
import { upsertSchoolUsers } from "@/lib/domain/usecases/v3.usecases/reconcile/upsert_school_users.usecase";
import type { ReconcileClassInput, ReconcileResult } from "@/lib/entities/reconcile.type";

/**
 * Atomically reconciles an incoming V2/V3 Frappe class + participant roster into
 * Silid V3's MySQL database inside a single Drizzle transaction:
 * `school/department/section/subject/classroom/class_card -> users -> participants`.
 */
export async function reconcileClassRosterToMysql(
  input: ReconcileClassInput,
): Promise<ReconcileResult> {
  const roster = dedupeRosterByEmail(input.roster);
  const disableStale =
    roster.length > 0 ? shouldDisableStaleStudents(roster.length, input) : false;
  const reEnableDisabled = input.reEnableDisabled ?? true;

  return database.transaction(async (tx) => {
    const graph = await reconcileSchoolAndClassCard(tx, input);

    const result: ReconcileResult = {
      schoolId: graph.schoolId,
      classroomId: graph.classroomId,
      classCardId: graph.classCardId,
      usersCreated: 0,
      usersUpdated: 0,
      participantsInserted: 0,
      participantsEnabled: 0,
      participantsDisabled: 0,
      disableStaleSkipped: !disableStale,
    };

    const emailToUserId =
      roster.length > 0
        ? await upsertSchoolUsers(tx, {
            schoolCode: input.schoolCode.trim(),
            roster,
            result,
            keepExistingRole: input.keepExistingRole,
          })
        : new Map<string, string>();

    await syncClassCardParticipants(tx, {
      classCardId: graph.classCardId,
      roster,
      emailToUserId,
      disableStale,
      reEnableDisabled,
      allowedTeacherEmails: input.allowedTeacherEmails,
      disableEmails: input.disableEmails,
      result,
    });

    return result;
  });
}
