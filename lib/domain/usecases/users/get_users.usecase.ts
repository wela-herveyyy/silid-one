import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import { user } from "@/drizzle/schema";
import type { UserSelect } from "@/lib/entities/users.type";

export async function getUsers(): Promise<UserSelect[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("users");

  try {
    return await database.select().from(user).orderBy(desc(user.createdAt));
  } catch (error) {
    console.error("[getUsers]", error);
    return [];
  }
}

export async function getUsersByRole(role: string): Promise<UserSelect[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("users");

  try {
    return await database
      .select()
      .from(user)
      .where(eq(user.role, role))
      .orderBy(desc(user.createdAt));
  } catch (error) {
    console.error("[getUsersByRole]", error);
    return [];
  }
}
