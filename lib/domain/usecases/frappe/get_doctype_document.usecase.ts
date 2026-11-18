import {
  getV1DocList,
  getV1Document,
} from "@/lib/domain/usecases/v1.usecases/doctype/get_v1_doctype_document.usecase";
import { getV2Document } from "@/lib/domain/usecases/v2.usecases/doctype/get_v2_doctype_document.usecase";
import { getV2DocList } from "@/lib/domain/usecases/v2.usecases/doctype/get_v2_doctype_list.usecase";
import { getV3Document } from "@/lib/domain/usecases/v3.usecases/doctype/get_v3_doctype_document.usecase";
import { getV3DocList } from "@/lib/domain/usecases/v3.usecases/doctype/get_v3_doctype_list.usecase";
import type { FrappeDocResult, SchoolVersion } from "@/lib/entities/frappe.type";

export async function frappeGetDocList<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  fields?: string[];
  filters?: unknown;
  limitPageLength?: number;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<T[]>> {
  if (input.version === "v3") return getV3DocList<T>(input);
  if (input.version === "v1") return getV1DocList<T>(input);
  return getV2DocList<T>(input);
}

export async function frappeGetDocument<T = Record<string, unknown>>(input: {
  baseUrl: string;
  sid: string;
  doctype: string;
  name: string;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<T>> {
  if (input.version === "v3") return getV3Document<T>(input);
  if (input.version === "v1") return getV1Document<T>(input);
  return getV2Document<T>(input);
}
