import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/domain/services/auth.service";

const guardedPaths = [
  "/",
  "/class",
  "/courses",
  "/activity-bank",
  "/chat",
  "/lessons",
  "/settings",
  "/two-factor-auth",
  "/users",
];

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!matchesPath(pathname, guardedPaths)) {
    return NextResponse.next();
  }

  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    const callbackPath = `${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(
      new URL(`/login?callbackURL=${encodeURIComponent(callbackPath)}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
