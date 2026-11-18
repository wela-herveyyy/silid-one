import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import type { AuthResult, AuthUser } from "@/lib/entities/auth.type";
import { USER_ROLE } from "@/lib/entities/users.type";

function toAuthEmail(emailOrUsr: string): string {
  const clean = emailOrUsr.trim().toLowerCase();
  if (clean.includes("@")) return clean;
  return `${clean.replace(/[^a-z0-9._-]/g, "_")}@frappe.local`;
}

/**
 * Ensures an externally verified Frappe user exists in Better Auth's `user` table,
 * creates a persistent Better Auth `session`, and sets the signed session cookie.
 */
export async function createFrappeBridgeSession(input: {
  email: string;
  fullName: string;
}): Promise<AuthResult<AuthUser>> {
  try {
    const authEmail = toAuthEmail(input.email);
    const displayName = input.fullName.trim() || authEmail;
    const ctx = await auth.$context;

    const existing = await ctx.internalAdapter.findUserByEmail(authEmail);
    let targetUser = existing?.user ?? null;

    if (!targetUser) {
      targetUser = await ctx.internalAdapter.createUser(
        {
          email: authEmail,
          name: displayName,
          emailVerified: true,
          role: USER_ROLE.TEACHER,
        },
        { method: "frappe-school" },
      );
    } else if (displayName && targetUser.name !== displayName) {
      await ctx.internalAdapter.updateUser(targetUser.id, {
        name: displayName,
      });
    }

    const createdSession = await ctx.internalAdapter.createSession(targetUser.id);
    if (!createdSession) {
      return { ok: false, error: "Could not create Better Auth session." };
    }

    const cookieConfig = ctx.authCookies.sessionToken;
    const signature = createHmac("sha256", ctx.secret)
      .update(createdSession.token)
      .digest("base64");
    const signedCookieValue = `${createdSession.token}.${signature}`;

    const reqHeaders = await headers();
    const proto =
      reqHeaders.get("x-forwarded-proto") ||
      (reqHeaders.get("origin")?.startsWith("https://") ? "https" : "http");
    const isSecure = proto === "https";

    const cookieStore = await cookies();
    cookieStore.set(cookieConfig.name, signedCookieValue, {
      httpOnly: cookieConfig.attributes.httpOnly ?? true,
      sameSite: (cookieConfig.attributes.sameSite as "lax" | "strict" | "none") ?? "lax",
      secure: isSecure,
      path: cookieConfig.attributes.path ?? "/",
      maxAge: cookieConfig.attributes.maxAge ?? 60 * 60 * 24 * 7,
    });

    return {
      ok: true,
      data: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        image: targetUser.image,
      },
    };
  } catch (error) {
    console.error("[createFrappeBridgeSession]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to bridge Frappe session.",
    };
  }
}
