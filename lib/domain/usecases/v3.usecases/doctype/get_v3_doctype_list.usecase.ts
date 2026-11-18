import { frappeHttpGetList } from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { FrappeDocResult } from "@/lib/entities/frappe.type";

/** Queries a list of V3 Frappe DocTypes over HTTP using `Cookie: sid=${sid}`. */
export async function getV3DocList<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  fields?: string[];
  filters?: unknown;
  limitPageLength?: number;
}): Promise<FrappeDocResult<T[]>> {
  return frappeHttpGetList<T>(input);
}
