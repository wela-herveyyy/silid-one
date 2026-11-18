"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/domain/services/auth.service";
import { deleteUser, getDevUsers, getUsers } from "@/lib/domain/services/users.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import {
  hasPermission,
  USER_PERMISSION,
  type UserResult,
  type UserSelect,
} from "@/lib/entities/users.type";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function getUsersAction(): Promise<UserResult<UserSelect[]>> {
  const action = "users:list";

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.USERS_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "You are not authorized for this action." };
    }

    const users = await getUsers();

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: users };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function getDevUsersAction(): Promise<UserResult<UserSelect[]>> {
  const action = "users:list-dev";

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.USERS_READ)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      return { ok: false, error: "You are not authorized for this action." };
    }

    const users = await getDevUsers();

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return { ok: true, data: users };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const action = "users:delete";
  const id = readField(formData, "id");

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
    if (!hasPermission(userSession.user.role, USER_PERMISSION.USERS_DELETE)) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: "Not authorized.",
        role: userSession.user.role,
      });
      redirect("/users?error=You+are+not+authorized+to+delete+users");
    }

    const res = await deleteUser({ id });
    if (!res.ok) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: res.error,
        role: userSession.user.role,
      });
      redirect(`/users?error=${encodeURIComponent(res.error)}`);
    }

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
      metadata: { targetId: id },
    });

    revalidatePath("/users");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    redirect(`/users?error=${encodeURIComponent(message)}`);
  }
}
