import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import { course } from "@/drizzle/schema";
import { nowMysqlDatetime } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type { CourseStatus, ExternalCourseItem } from "@/types/lms";

export async function updateV3CourseStatus(courseId: string, status: CourseStatus): Promise<void> {
  await database
    .update(course)
    .set({
      status,
      updatedAt: nowMysqlDatetime(),
    })
    .where(eq(course.id, courseId));

  updateTag("courses");
}

export async function createV3Course(input: {
  userId?: string | null;
  item: Omit<ExternalCourseItem, "id" | "publishedAt" | "lessons">;
}): Promise<string> {
  const now = nowMysqlDatetime();
  const id = randomUUID();

  await database.insert(course).values({
    id,
    title: input.item.title.trim(),
    description: input.item.description.trim(),
    color: input.item.accentColor || "#ea580c",
    status: input.item.status,
    referenceUrl: input.item.referenceUrl || null,
    createdBy: input.userId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  updateTag("courses");
  return id;
}
