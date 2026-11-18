import { createFrappeBridgeSession } from "@/lib/domain/usecases/auth/create_frappe_session.usecase";
import { frappeGetDocument } from "@/lib/domain/usecases/frappe/get_doctype_document.usecase";
import { getFrappeClassesWithSid } from "@/lib/domain/usecases/frappe/get_frappe_classes.usecase";
import { loginFrappeSchool } from "@/lib/domain/usecases/frappe/login_frappe_school.usecase";
import type { AuthResult, AuthUser } from "@/lib/entities/auth.type";
import type {
  FrappeClassItem,
  FrappeDocResult,
  FrappeLoginSuccess,
  SchoolVersion,
} from "@/lib/entities/frappe.type";

export type FrappeSessionBridgeResult = {
  frappe: FrappeLoginSuccess;
  user: AuthUser;
};

export async function signInWithFrappeSchool(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
  version?: SchoolVersion;
}): Promise<AuthResult<FrappeSessionBridgeResult>> {
  const frappeRes = await loginFrappeSchool(input);
  if (!frappeRes.ok) {
    return { ok: false, error: frappeRes.error };
  }

  const sessionRes = await createFrappeBridgeSession({
    email: frappeRes.data.email,
    fullName: frappeRes.data.fullName,
  });

  if (!sessionRes.ok) {
    return { ok: false, error: sessionRes.error };
  }

  return {
    ok: true,
    data: {
      frappe: frappeRes.data,
      user: sessionRes.data,
    },
  };
}

export async function getFrappeClasses(input: {
  baseUrl: string;
  sid: string;
  email: string;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<FrappeClassItem[]>> {
  return getFrappeClassesWithSid(input);
}

export async function getFrappeDoc<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  name: string;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<T>> {
  return frappeGetDocument<T>(input);
}
