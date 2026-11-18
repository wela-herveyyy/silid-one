import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/auth";
import { database } from "@/database";
import type { AuthSession } from "@/lib/entities/auth.type";
import { user as userTable, session as sessionTable } from "@/drizzle/schema";

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    const raw = part.slice(idx + 1).trim();
    return raw ? raw : null;
  }
  return null;
}

function unsignedToken(raw: string): string {
  const decoded = decodeURIComponent(raw);
  const dot = decoded.lastIndexOf(".");
  return dot > 0 ? decoded.slice(0, dot) : decoded;
}

export async function getSessionFromHeaders(
  requestHeaders: Headers,
): Promise<AuthSession | null> {
  try {
    const ctx = await auth.$context;
    const cookieName = ctx.authCookies.sessionToken.name;
    const raw =
      cookieValue(requestHeaders.get("cookie"), cookieName) ||
      cookieValue(requestHeaders.get("cookie"), cookieName.replace(/^__Secure-/, ""));
    if (!raw) return null;

    const token = unsignedToken(raw);
    if (!token) return null;

    const rows = await database
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        expiresAt: sessionTable.expiresAt,
      })
      .from(sessionTable)
      .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
      .where(eq(sessionTable.token, token))
      .limit(1);

    const row = rows[0];
    if (!row || new Date(row.expiresAt) <= new Date()) return null;

    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
      },
    };
  } catch (error) {
    console.error("[getSession]", error);
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  await connection();
  return getSessionFromHeaders(await headers());
}
