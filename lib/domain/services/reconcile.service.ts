import { reconcileClassRosterToMysql } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_class_roster.usecase";
import type {
  ReconcileActionResult,
  ReconcileClassInput,
  ReconcileResult,
} from "@/lib/entities/reconcile.type";

export async function reconcileFrappeClassToMysql(
  input: ReconcileClassInput,
): Promise<ReconcileActionResult<ReconcileResult>> {
  try {
    const data = await reconcileClassRosterToMysql(input);
    return { ok: true, data };
  } catch (error) {
    console.error("[reconcileFrappeClassToMysql]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to reconcile class into Silid V3 DB.",
    };
  }
}
