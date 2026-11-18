import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { database } from "@/database";
import { account, session, user, verification } from "@/drizzle/schema";

const publicAuthUrl = (process.env.BETTER_AUTH_URL || "").trim().replace(/\/+$/, "");
const isHttpsAuth = publicAuthUrl.startsWith("https://");

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-silid-one-better-auth-secret-change-in-prod"
      : undefined),
  baseURL: publicAuthUrl || undefined,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "dev",
        input: false,
      },
      schoolName: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: false,
    },
  },
  advanced: {
    useSecureCookies: isHttpsAuth,
    defaultCookieAttributes: {
      sameSite: "lax",
      path: "/",
      secure: isHttpsAuth,
    },
  },
  database: drizzleAdapter(database, {
    provider: "mysql",
    schema: { user, session, account, verification },
  }),
  plugins: [nextCookies()],
});
