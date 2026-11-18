import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import { user } from "@/drizzle/schema";
import type { UserResult } from "@/lib/entities/users.type";

export async function deleteUser(input: { id: string }): Promise<UserResult> {
  try {
    await database.delete(user).where(eq(user.id, input.id));
    updateTag("users");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteUser]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete user.",
    };
  }
}
