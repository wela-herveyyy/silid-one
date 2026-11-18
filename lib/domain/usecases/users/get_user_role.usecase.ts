import { eq } from "drizzle-orm";
import { database } from "@/database";
import { user } from "@/drizzle/schema";
import type { UserRole } from "@/lib/entities/users.type";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const rows = await database
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const role = rows[0]?.role;
    return role && role.trim().length > 0 ? role : null;
  } catch (error) {
    console.error("[getUserRole]", error);
    return null;
  }
}
