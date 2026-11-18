"use server";

import { searchSchools } from "@/lib/domain/services/schools.service";
import type { SchoolSearchResult } from "@/lib/entities/schools.type";

/**
 * Pre-authentication school search action — intentionally skips AAA so users
 * can select their school before signing in.
 */
export async function searchSchoolsAction(query: string): Promise<SchoolSearchResult> {
  try {
    const data = await searchSchools(query);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to search schools.",
    };
  }
}
