import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import { activities } from "@/drizzle/schema";
import type { ActivityResult } from "@/lib/entities/activities.type";

export async function toggleArchiveActivity(input: {
  id: string;
  archive: boolean;
}): Promise<ActivityResult> {
  try {
    await database
      .update(activities)
      .set({
        archive: input.archive ? 1 : 0,
        updatedAt: new Date().toISOString().slice(0, 23).replace("T", " "),
      })
      .where(eq(activities.id, input.id));
    updateTag("activities");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[toggleArchiveActivity]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update activity.",
    };
  }
}
