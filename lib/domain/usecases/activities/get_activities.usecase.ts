import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import type { ActivitySummary } from "@/lib/entities/activities.type";
import { activities } from "@/drizzle/schema";

export async function getActivitiesByClass(classCardId: string): Promise<ActivitySummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("activities");

  try {
    const rows = await database
      .select()
      .from(activities)
      .where(eq(activities.classCardId, classCardId))
      .orderBy(desc(activities.createdAt))
      .limit(100);

    return rows.map((row) => ({
      id: row.id,
      classCardId: row.classCardId,
      type: row.type,
      title: row.title,
      points: row.points,
      topic: row.topic,
      publishedDate: row.publishedDate,
      deadline: row.deadline,
      archive: Boolean(row.archive),
      bank: Boolean(row.bank),
    }));
  } catch (error) {
    console.error("[getActivitiesByClass]", error);
    return [];
  }
}
