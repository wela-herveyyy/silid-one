import { frappeHttpGetDocument } from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { FrappeDocResult } from "@/lib/entities/frappe.type";

/** Fetches a single V3 Frappe Document (`frappe.client.get`) using `Cookie: sid=${sid}`. */
export async function getV3Document<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  name: string;
}): Promise<FrappeDocResult<T>> {
  return frappeHttpGetDocument<T>(input);
}
