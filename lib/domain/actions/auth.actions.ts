"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut, signUp } from "@/lib/domain/services/auth.service";
import { signInWithFrappeSchool } from "@/lib/domain/services/frappe.service";
import { FRAPPE_COOKIE_NAMES, type SchoolVersion } from "@/lib/entities/frappe.type";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function parseSchoolVersion(raw: string): SchoolVersion {
  if (raw === "v1" || raw === "v2" || raw === "v3") return raw;
  return "v2";
}

export async function signInAction(formData: FormData) {
  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const schoolSite = readField(formData, "schoolSite");
  const schoolCode = readField(formData, "schoolCode");
  const schoolName = readField(formData, "schoolName");
  const schoolVersion = parseSchoolVersion(readField(formData, "schoolVersion"));
  const callbackURL = readField(formData, "callbackURL") || "/class";

  const nextPath = callbackURL.startsWith("/") ? callbackURL : "/class";

  if (schoolSite) {
    const frappeResult = await signInWithFrappeSchool({
      baseUrl: schoolSite,
      usr: email,
      pwd: password,
      version: schoolVersion,
    });

    if (!frappeResult.ok) {
      redirect(`/login?error=${encodeURIComponent(frappeResult.error)}`);
    }

    const reqHeaders = await headers();
    const proto =
      reqHeaders.get("x-forwarded-proto") ||
      (reqHeaders.get("origin")?.startsWith("https://") ? "https" : "http");

    const cookieStore = await cookies();
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: proto === "https",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };

    cookieStore.set(FRAPPE_COOKIE_NAMES.SID, frappeResult.data.frappe.sid, cookieOpts);
    cookieStore.set(FRAPPE_COOKIE_NAMES.SITE, frappeResult.data.frappe.baseUrl, cookieOpts);
    cookieStore.set(FRAPPE_COOKIE_NAMES.SCHOOL_CODE, schoolCode, cookieOpts);
    cookieStore.set(FRAPPE_COOKIE_NAMES.SCHOOL_NAME, schoolName || frappeResult.data.frappe.baseUrl, cookieOpts);
    cookieStore.set(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION, frappeResult.data.frappe.version, cookieOpts);

    redirect(nextPath);
  }

  const result = await signIn({
    email,
    password,
    callbackURL: nextPath,
    rememberMe: true,
  });

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const callbackURL = readField(formData, "callbackURL") || "/class";

  const nextPath = callbackURL.startsWith("/") ? callbackURL : "/class";
  const result = await signUp({
    name,
    email,
    password,
    callbackURL: nextPath,
  });

  if (!result.ok) {
    redirect(`/login?mode=signup&error=${encodeURIComponent(result.error)}`);
  }

  redirect(nextPath);
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(FRAPPE_COOKIE_NAMES.SID);
  cookieStore.delete(FRAPPE_COOKIE_NAMES.SITE);
  cookieStore.delete(FRAPPE_COOKIE_NAMES.SCHOOL_CODE);
  cookieStore.delete(FRAPPE_COOKIE_NAMES.SCHOOL_NAME);
  cookieStore.delete(FRAPPE_COOKIE_NAMES.SCHOOL_VERSION);

  const result = await signOut();
  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/login");
}
