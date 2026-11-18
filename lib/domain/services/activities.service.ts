import type { ActivityResult, ActivitySummary } from "@/lib/entities/activities.type";
import { getActivitiesByClass as getActivitiesByClassUseCase } from "@/lib/domain/usecases/activities/get_activities.usecase";
import { toggleArchiveActivity as toggleArchiveActivityUseCase } from "@/lib/domain/usecases/activities/toggle_archive_activity.usecase";

export async function getActivitiesByClass(classCardId: string): Promise<ActivitySummary[]> {
  return getActivitiesByClassUseCase(classCardId);
}

export async function toggleArchiveActivity(input: {
  id: string;
  archive: boolean;
}): Promise<ActivityResult> {
  return toggleArchiveActivityUseCase(input);
}
