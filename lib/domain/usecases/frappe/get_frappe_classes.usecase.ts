import { getV1ClassesWithSid } from "@/lib/domain/usecases/v1.usecases/classes/get_v1_classes.usecase";
import { getV2ClassesWithSid } from "@/lib/domain/usecases/v2.usecases/classes/get_v2_classes.usecase";
import { getV3ClassesWithSid } from "@/lib/domain/usecases/v3.usecases/classes/get_v3_classes.usecase";
import type {
  FrappeClassItem,
  FrappeDocResult,
  SchoolVersion,
} from "@/lib/entities/frappe.type";

const CLASS_HANDLERS: Record<
  SchoolVersion,
  (input: { baseUrl: string; sid: string; email: string }) => Promise<FrappeDocResult<FrappeClassItem[]>>
> = {
  v1: getV1ClassesWithSid,
  v2: getV2ClassesWithSid,
  v3: getV3ClassesWithSid,
};

export async function getFrappeClassesWithSid(input: {
  baseUrl: string;
  sid: string;
  email: string;
  version?: SchoolVersion;
}): Promise<FrappeDocResult<FrappeClassItem[]>> {
  const version: SchoolVersion = input.version ?? "v2";
  return CLASS_HANDLERS[version](input);
}
