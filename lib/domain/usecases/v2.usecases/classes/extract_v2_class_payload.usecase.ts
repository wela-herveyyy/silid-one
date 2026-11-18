import type { ReconcileParticipantInput } from "@/lib/entities/reconcile.type";

export type V2StudentRow = {
  name?: string;
  student?: string;
  student_name?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  id_number?: string | null;
  email?: string | null;
  email_address?: string | null;
  student_email_id?: string | null;
  user_name?: string | null;
  level?: string | null;
  branch?: string | null;
  gender?: string | null;
};

export type V2ScheduleRow = {
  subject?: string;
  subject_name?: string;
  subject_code?: string;
  teacher?: string;
  teacher_name?: string;
  start_time?: string;
  end_time?: string;
  day?: string;
};

export type RawV2ClassDoc = {
  name: string;
  title?: string | null;
  section?: string | null;
  school_year?: string | null;
  class_name?: string | null;
  adviser?: string | null;
  teacher?: string | null;
  assistant_adviser?: string | null;
  room?: string | null;
  time_schedule?: string | null;
  department?: string | null;
  grade_level?: string | null;
  class_schedule?: V2ScheduleRow[];
  class_schedule_shs?: V2ScheduleRow[];
  class_schedule_2?: V2ScheduleRow[];
  students?: V2StudentRow[];
};

function slugToV2Email(rawId: string, schoolCode: string): string {
  const cleanCode = schoolCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "v2";
  const slug = rawId.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return `${slug || "user"}@${cleanCode}.v2.local`;
}

function buildV2StudentName(s: V2StudentRow): string {
  if (s.student_name?.trim()) return s.student_name.trim();
  if (s.full_name?.trim()) return s.full_name.trim();
  const full = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  return (s.name || s.student || "").trim();
}

export function resolveV2PersonEmail(rawEmailOrId: string, schoolCode: string): string {
  const clean = rawEmailOrId.trim();
  if (clean.includes("@")) return clean.toLowerCase();
  return slugToV2Email(clean, schoolCode);
}

/**
 * Extracts normalized `department`, `level`, `sectionName`, `schedules`, and `roster`
 * (`teacher`, `assistant_adviser`, schedule teachers, and `students[]`) from a V2 Frappe `Class` doc.
 */
export function extractV2ClassMetadataAndRoster(
  doc: RawV2ClassDoc,
  schoolCode: string,
  extraStaffEmails: Array<{ name: string; email: string; role: "teacher" | "admin" | "student" }> = [],
) {
  const students = Array.isArray(doc.students) ? doc.students : [];
  const departmentName =
    doc.department?.trim() ||
    students.find((s) => s.branch)?.branch?.trim() ||
    "Main Campus";
  const level =
    doc.grade_level?.trim() ||
    students.find((s) => s.level)?.level?.trim() ||
    "General";
  const sectionName = (doc.section || doc.name).trim();

  const schedules: V2ScheduleRow[] = [
    ...(Array.isArray(doc.class_schedule) ? doc.class_schedule : []),
    ...(Array.isArray(doc.class_schedule_shs) ? doc.class_schedule_shs : []),
    ...(Array.isArray(doc.class_schedule_2) ? doc.class_schedule_2 : []),
  ];

  const roster: ReconcileParticipantInput[] = [];
  const allowedTeacherEmails = new Set<string>();

  for (const extra of extraStaffEmails) {
    if (!extra.email) continue;
    const cleanEmail = extra.email.trim().toLowerCase();
    roster.push({ name: extra.name || cleanEmail, email: cleanEmail, role: extra.role });
    if (extra.role === "teacher" || extra.role === "admin") {
      allowedTeacherEmails.add(cleanEmail);
    }
  }

  for (const rawTeacher of [doc.teacher, doc.adviser, doc.assistant_adviser]) {
    const tName = rawTeacher?.trim();
    if (!tName) continue;
    const tEmail = resolveV2PersonEmail(tName, schoolCode);
    roster.push({ name: tName, email: tEmail, role: "teacher" });
    allowedTeacherEmails.add(tEmail);
  }

  for (const s of students) {
    const sName = buildV2StudentName(s);
    if (!sName) continue;
    const rawIdentifier =
      s.email_address ||
      s.student_email_id ||
      s.email ||
      s.user_name ||
      s.id_number ||
      s.name ||
      s.student;
    if (!rawIdentifier) continue;
    roster.push({
      name: sName,
      email: resolveV2PersonEmail(rawIdentifier, schoolCode),
      role: "student",
    });
  }

  return {
    departmentName,
    level,
    sectionName,
    schedules,
    roster,
    allowedTeacherEmails: [...allowedTeacherEmails],
    studentCount: students.length,
  };
}
