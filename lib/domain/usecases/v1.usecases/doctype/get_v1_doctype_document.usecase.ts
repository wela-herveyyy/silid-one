import {
  frappeHttpGetDocument,
  frappeHttpGetList,
  frappeHttpLogin,
} from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { FrappeDocResult, FrappeLoginSuccess } from "@/lib/entities/frappe.type";

/** Legacy V1 Frappe authentication (`version: "v1"`). */
export async function loginV1School(input: {
  baseUrl: string;
  usr: string;
  pwd: string;
}): Promise<FrappeDocResult<FrappeLoginSuccess>> {
  return frappeHttpLogin({ ...input, version: "v1" });
}

/** Legacy V1 Frappe DocType list helper (`Cookie: sid=...`). */
export async function getV1DocList<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  fields?: string[];
  filters?: unknown;
  limitPageLength?: number;
}): Promise<FrappeDocResult<T[]>> {
  return frappeHttpGetList<T>(input);
}

/** Legacy V1 Frappe single document reader (`Cookie: sid=...`). */
export async function getV1Document<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  name: string;
}): Promise<FrappeDocResult<T>> {
  return frappeHttpGetDocument<T>(input);
}
