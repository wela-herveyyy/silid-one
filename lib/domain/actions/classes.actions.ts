"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/domain/services/auth.service";
import { getClasses, updateClassAppearance } from "@/lib/domain/services/classes.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import type { ClassCardSummary, ClassResult } from "@/lib/entities/classes.type";
import { hasPermission, USER_PERMISSION } from "@/lib/entities/users.type";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function getClassesAction(): Promise<ClassResult<ClassCardSummary[]>> {
  const action = "classes:list";

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "You are not authorized for this action." };
    }

    const items = await getClasses();

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

export async function updateClassAction(formData: FormData): Promise<void> {
  const action = "classes:update";
  const id = readField(formData, "id");
  const color = readField(formData, "color") || undefined;

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.CLASSES_WRITE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      redirect(`/class/edit/${encodeURIComponent(id)}?error=Not+authorized`);
    }

    const res = await updateClassAppearance({ id, color });
    if (!res.ok) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: res.error,
        role: userSession.user.role,
      });
      redirect(`/class/edit/${encodeURIComponent(id)}?error=${encodeURIComponent(res.error)}`);
    }

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
      metadata: { classCardId: id },
    });

    revalidatePath("/class");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    redirect(`/class?error=${encodeURIComponent(message)}`);
  }
}
