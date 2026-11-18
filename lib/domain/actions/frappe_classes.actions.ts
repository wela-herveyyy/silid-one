"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/domain/services/auth.service";
import { getFrappeClasses, getFrappeDoc } from "@/lib/domain/services/frappe.service";
import { logAction } from "@/lib/domain/usecases/auth/log_action.usecase";
import {
  FRAPPE_COOKIE_NAMES,
  type FrappeClassItem,
  type FrappeDocResult,
  type SchoolVersion,
} from "@/lib/entities/frappe.type";

function parseSchoolVersion(raw: string | undefined): SchoolVersion {
  if (raw === "v1" || raw === "v2" || raw === "v3") return raw;
  return "v2";
}
import { hasPermission, USER_PERMISSION } from "@/lib/entities/users.type";

export type FrappeClassesPayload = {
  connected: boolean;
  schoolName: string;
  schoolCode: string;
  schoolSite: string;
  classes: FrappeClassItem[];
  sourceError?: string;
};

export async function getFrappeClassesAction(): Promise<FrappeDocResult<FrappeClassesPayload>> {
  const action = "frappe:classes:list";

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
      return { ok: false, error: "You are not authorized to view classes." };
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get(FRAPPE_COOKIE_NAMES.SID)?.value ?? "";
    const site = cookieStore.get(FRAPPE_COOKIE_NAMES.SITE)?.value ?? "";
    const schoolCode = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_CODE)?.value ?? "";
    const schoolName = cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_NAME)?.value ?? "";
    const version = parseSchoolVersion(cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION)?.value);

    if (!sid || !site) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: true,
        role: userSession.user.role,
      });
      return {
        ok: true,
        data: {
          connected: false,
          schoolName,
          schoolCode,
          schoolSite: site,
          classes: [],
        },
      };
    }

    const res = await getFrappeClasses({
      baseUrl: site,
      sid,
      email: userSession.user.email,
      version,
    });

    if (!res.ok) {
      await logAction({
        userId: userSession.user.id,
        action,
        success: false,
        error: res.error,
        role: userSession.user.role,
      });
      return {
        ok: true,
        data: {
          connected: true,
          schoolName,
          schoolCode,
          schoolSite: site,
          classes: [],
          sourceError: res.error,
        },
      };
    }

    // 3. Accounting
    await logAction({
      userId: userSession.user.id,
      action,
      success: true,
      role: userSession.user.role,
    });

    return {
      ok: true,
      data: {
        connected: true,
        schoolName,
        schoolCode,
        schoolSite: site,
        classes: res.data,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}

export async function getFrappeDocumentAction(
  doctype: string,
  name: string,
): Promise<FrappeDocResult<Record<string, unknown>>> {
  const action = "frappe:doctype:get";

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
      return { ok: false, error: "You are not authorized to view documents." };
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get(FRAPPE_COOKIE_NAMES.SID)?.value ?? "";
    const site = cookieStore.get(FRAPPE_COOKIE_NAMES.SITE)?.value ?? "";
    const version = parseSchoolVersion(cookieStore.get(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION)?.value);

    if (!sid || !site) {
      return { ok: false, error: "No active Frappe school session sid." };
    }

    const res = await getFrappeDoc({
      baseUrl: site,
      sid,
      doctype,
      name,
      version,
    });

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
    const message = error instanceof Error ? error.message : "Unexpected error.";
    await logAction({ userId: "unknown", action, success: false, error: message });
    return { ok: false, error: message };
  }
}
