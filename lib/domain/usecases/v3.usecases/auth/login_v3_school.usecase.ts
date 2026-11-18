import { frappeHttpLogin } from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { FrappeDocResult, FrappeLoginSuccess } from "@/lib/entities/frappe.type";

/** Signs into a V3 Wela Frappe site (`/api/method/login`) and returns its `sid` session. */
export async function loginV3School(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
}): Promise<FrappeDocResult<FrappeLoginSuccess>> {
  return frappeHttpLogin({
    ...input,
    version: "v3",
  });
}
