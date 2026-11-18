import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import { classCard } from "@/drizzle/schema";
import type { ClassResult } from "@/lib/entities/classes.type";

export async function updateClassAppearance(input: {
  id: string;
  color?: string;
  archive?: boolean;
}): Promise<ClassResult> {
  try {
    const patch: Partial<typeof classCard.$inferInsert> = {
      updatedAt: new Date().toISOString().slice(0, 23).replace("T", " "),
    };
    if (input.color !== undefined) patch.color = input.color;
    if (input.archive !== undefined) patch.archive = input.archive ? 1 : 0;

    await database.update(classCard).set(patch).where(eq(classCard.id, input.id));
    updateTag("classes");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[updateClassAppearance]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update class.",
    };
  }
}
