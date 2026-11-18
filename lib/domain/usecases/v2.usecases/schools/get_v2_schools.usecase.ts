import { normalizeFrappeBaseUrl } from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { SchoolOption } from "@/lib/entities/schools.type";

export const V2_KNOWN_SCHOOLS: SchoolOption[] = [
  {
    id: "v2-ccs",
    name: "CCS · Wela V2",
    schoolCode: "CCS",
    site: "https://ccs.wela.online",
    version: "v2",
  },
];

/** Searches known V2 Frappe school sites or accepts a direct V2 `https://` URL. */
export function searchV2Schools(query: string): SchoolOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return V2_KNOWN_SCHOOLS;

  const matches = V2_KNOWN_SCHOOLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.schoolCode.toLowerCase().includes(q) ||
      s.site.toLowerCase().includes(q),
  );

  if (matches.length === 0 && /^https?:\/\//i.test(query.trim())) {
    const customSite = normalizeFrappeBaseUrl(query.trim());
    return [
      {
        id: `custom-v2-${customSite}`,
        name: `V2 Site (${customSite})`,
        schoolCode: "CUSTOM",
        site: customSite,
        version: "v2",
      },
    ];
  }

  return matches;
}
