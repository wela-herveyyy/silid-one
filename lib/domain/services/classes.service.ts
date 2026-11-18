import type { ClassCardSummary, ClassResult } from "@/lib/entities/classes.type";
import { getClasses as getClassesUseCase } from "@/lib/domain/usecases/classes/get_classes.usecase";
import { updateClassAppearance as updateClassAppearanceUseCase } from "@/lib/domain/usecases/classes/update_class.usecase";

export async function getClasses(): Promise<ClassCardSummary[]> {
  return getClassesUseCase();
}

export async function updateClassAppearance(input: {
  id: string;
  color?: string;
  archive?: boolean;
}): Promise<ClassResult> {
  return updateClassAppearanceUseCase(input);
}
