import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import { schools } from "@/drizzle/schema";
import { normalizeFrappeBaseUrl } from "@/lib/domain/usecases/frappe/frappe_http.helper";
import type { SchoolOption } from "@/lib/entities/schools.type";

/** Cached list of V3 Wela school sites from the Drizzle `schools` table. */
export async function listV3SchoolsCached(): Promise<SchoolOption[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("schools");

  const dbRows = await database
    .select({
      id: schools.id,
      name: schools.name,
      schoolCode: schools.schoolCode,
      site: schools.site,
    })
    .from(schools)
    .orderBy(asc(schools.name));

  const seenCodes = new Set<string>();
  const list: SchoolOption[] = [];

  for (const row of dbRows) {
    const cleanSite = normalizeFrappeBaseUrl(row.site);
    if (!cleanSite.startsWith("http")) continue;
    const codeKey = row.schoolCode.trim().toLowerCase();
    if (seenCodes.has(codeKey)) continue;
    seenCodes.add(codeKey);
    list.push({
      id: row.id,
      name: row.name.trim(),
      schoolCode: row.schoolCode.trim(),
      site: cleanSite,
      version: "v3",
    });
  }

  return list;
}

/** Searches V3 schools stored in Drizzle MySQL (`schools` table). */
export async function searchV3Schools(query: string): Promise<SchoolOption[]> {
  try {
    const all = await listV3SchoolsCached();
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 15);

    return all
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.schoolCode.toLowerCase().includes(q) ||
          s.site.toLowerCase().includes(q),
      )
      .slice(0, 20);
  } catch (error) {
    console.error("[searchV3Schools]", error);
    return [];
  }
}
