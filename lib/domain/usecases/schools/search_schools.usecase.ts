import { searchV2Schools } from "@/lib/domain/usecases/v2.usecases/schools/get_v2_schools.usecase";
import { searchV3Schools } from "@/lib/domain/usecases/v3.usecases/schools/get_v3_schools.usecase";
import type { SchoolOption } from "@/lib/entities/schools.type";

/** Searches across both V2 Frappe schools and V3 Drizzle `schools` rows. */
export async function searchSchools(query: string): Promise<SchoolOption[]> {
  const [v2, v3] = await Promise.all([
    Promise.resolve(searchV2Schools(query)),
    searchV3Schools(query),
  ]);

  const merged: SchoolOption[] = [];
  const seen = new Set<string>();

  for (const item of [...v2, ...v3]) {
    const key = `${item.version}:${item.site.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 20);
}
