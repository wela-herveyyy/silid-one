import { searchSchools as searchSchoolsUseCase } from "@/lib/domain/usecases/schools/search_schools.usecase";
import type { SchoolOption } from "@/lib/entities/schools.type";

export async function searchSchools(query: string): Promise<SchoolOption[]> {
  return searchSchoolsUseCase(query);
}
