"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/domain/services/auth.service";
import { reconcileFrappeClassToMysql } from "@/lib/domain/services/reconcile.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import type {
  ReconcileActionResult,
  ReconcileClassInput,
  ReconcileResult,
} from "@/lib/entities/reconcile.type";
import { hasPermission, USER_PERMISSION } from "@/lib/entities/users.type";

export async function reconcileFrappeClassAction(
  input: ReconcileClassInput,
): Promise<ReconcileActionResult<ReconcileResult>> {
  const action = "reconcile:frappe:class";

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_WRITE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "You are not authorized to reconcile classes." };
    }

    const res = await reconcileFrappeClassToMysql(input);
    if (res.ok) {
      updateTag("classes");
      updateTag("schools");
    }

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: res.ok,
      error: res.ok ? undefined : res.error,
      role: userSession.user.role,
    });

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reconciliation failed.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}
