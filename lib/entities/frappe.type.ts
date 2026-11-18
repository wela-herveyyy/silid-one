export type SchoolVersion = "v1" | "v2" | "v3";

export type FrappeLoginSuccess = {
  sid: string;
  email: string;
  fullName: string;
  baseUrl: string;
  version: SchoolVersion;
};

export type FrappeClassItem = {
  id: string;
  doctypeName: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  schoolYear: string;
  teacherName: string;
  schedule: string;
  studentCount: number;
};

export type FrappeDocResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const FRAPPE_COOKIE_NAMES = {
  SID: "silid_frappe_sid",
  SITE: "silid_frappe_site",
  SCHOOL_CODE: "silid_school_code",
  SCHOOL_NAME: "silid_school_name",
  SCHOOL_VERSION: "silid_school_version",
} as const;
