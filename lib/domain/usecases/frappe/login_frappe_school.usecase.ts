import { loginV1School } from "@/lib/domain/usecases/v1.usecases/doctype/get_v1_doctype_document.usecase";
import { loginV2School } from "@/lib/domain/usecases/v2.usecases/auth/login_v2_school.usecase";
import { loginV3School } from "@/lib/domain/usecases/v3.usecases/auth/login_v3_school.usecase";
import type {
  FrappeDocResult,
  FrappeLoginSuccess,
  SchoolVersion,
} from "@/lib/entities/frappe.type";

const LOGIN_HANDLERS: Record<
  SchoolVersion,
  (input: { baseUrl: string; usr: string; pwd: string }) => Promise<FrappeDocResult<FrappeLoginSuccess>>
> = {
  v1: loginV1School,
  v2: loginV2School,
  v3: loginV3School,
};

export async function loginFrappeSchool(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<FrappeLoginSuccess>> {
  const version: SchoolVersion = input.version ?? "v2";
  return LOGIN_HANDLERS[version](input);
}
