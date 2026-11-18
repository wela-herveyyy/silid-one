import type { SchoolVersion } from "@/lib/entities/frappe.type";

export type SchoolOption = {
  id: string;
  name: string;
  schoolCode: string;
  site: string;
  version: SchoolVersion;
};

export type SchoolSearchResult =
  | { ok: true; data: SchoolOption[] }
  | { ok: false; error: string };
