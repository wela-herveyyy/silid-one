"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getActivitiesByClass,
  toggleArchiveActivity,
} from "@/lib/domain/services/activities.service";
import { auth } from "@/lib/domain/services/auth.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import type { ActivityResult, ActivitySummary } from "@/lib/entities/activities.type";
import { hasPermission, USER_PERMISSION } from "@/lib/entities/users.type";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function getActivitiesAction(
  classCardId: string,
): Promise<ActivityResult<ActivitySummary[]>> {
  const action = "activities:list";

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.ACTIVITIES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "You are not authorized for this action." };
    }

    const items = await getActivitiesByClass(classCardId);

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: items };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function toggleArchiveActivityAction(formData: FormData): Promise<void> {
  const action = "activities:archive";
  const id = readField(formData, "id");
  const classId = readField(formData, "classId") || "cls-1";
  const archive = readField(formData, "archive") === "1";

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
      redirect("/login?error=Authentication+required");
    }

    // 2. Authorization
    if (!hasPermission(userSession.user.role, USER_PERMISSION.ACTIVITIES_WRITE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      redirect(`/class/view/${encodeURIComponent(classId)}/activities?error=Not+authorized`);
    }

    const res = await toggleArchiveActivity({ id, archive });
    if (!res.ok) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: res.error,
        role: userSession.user.role,
      });
      redirect(
        `/class/view/${encodeURIComponent(classId)}/activities?error=${encodeURIComponent(res.error)}`,
      );
    }

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
      metadata: { activityId: id, archive },
    });

    revalidatePath(`/class/view/${classId}/activities`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    redirect(
      `/class/view/${encodeURIComponent(classId)}/activities?error=${encodeURIComponent(message)}`,
    );
  }
}
