import { getClasses } from "@/lib/domain/usecases/classes/get_classes.usecase";
import { getV3Document } from "@/lib/domain/usecases/v3.usecases/doctype/get_v3_doctype_document.usecase";
import { getV3DocList } from "@/lib/domain/usecases/v3.usecases/doctype/get_v3_doctype_list.usecase";
import type { FrappeClassItem, FrappeDocResult } from "@/lib/entities/frappe.type";

type RawStudentGroupDoc = {
  name: string;
  student_group_name?: string;
  course?: string;
  program?: string;
  academic_year?: string;
  batch?: string;
  students?: Array<{ student?: string }>;
  instructors?: Array<{ instructor?: string; instructor_name?: string }>;
};

/**
 * Fetches V3 school classes via Frappe DocTypes (`"Student Group"` -> `"Course Schedule"` -> `"Class"` -> `"Subject"`)
 * using `Cookie: sid=...`, then falls back to Silid V3 Drizzle `class_card` records if available.
 */
export async function getV3ClassesWithSid(input: {
  baseUrl: string;
  sid: string;
  email: string;
}): Promise<FrappeDocResult<FrappeClassItem[]>> {
  // 1. V3 Education uses Student Group + Course Schedule / Class
  const sgList = await getV3DocList<{ name: string }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Student Group",
    fields: ["name"],
    limitPageLength: 30,
  });

  if (sgList.ok && sgList.data.length > 0) {
    const docs = await Promise.all(
      sgList.data.slice(0, 15).map((item) =>
        getV3Document<RawStudentGroupDoc>({
          baseUrl: input.baseUrl,
          sid: input.sid,
          doctype: "Student Group",
          name: item.name,
        }),
      ),
    );

    const mapped: FrappeClassItem[] = docs
      .filter((d): d is { ok: true; data: RawStudentGroupDoc } => d.ok)
      .map(({ data: doc }) => ({
        id: doc.name,
        doctypeName: doc.name,
        subjectName: doc.course || doc.student_group_name || doc.name,
        subjectCode: doc.name,
        sectionName: doc.batch || doc.program || doc.student_group_name || doc.name,
        schoolYear: doc.academic_year || "",
        teacherName: doc.instructors?.[0]?.instructor_name || doc.instructors?.[0]?.instructor || input.email,
        schedule: "V3 Student Group",
        studentCount: Array.isArray(doc.students) ? doc.students.length : 0,
      }));

    if (mapped.length > 0) {
      return { ok: true, data: mapped };
    }
  }

  // 2. Fallback to "Class" DocType
  const classList = await getV3DocList<{
    name: string;
    section?: string;
    school_year?: string;
    class_name?: string;
  }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Class",
    fields: ["name", "section", "school_year", "class_name"],
    limitPageLength: 30,
  });

  if (classList.ok && classList.data.length > 0) {
    return {
      ok: true,
      data: classList.data.map((item) => ({
        id: item.name,
        doctypeName: item.name,
        subjectName: item.class_name || item.name,
        subjectCode: item.name,
        sectionName: item.section || item.name,
        schoolYear: item.school_year || "",
        teacherName: input.email,
        schedule: "V3 Class",
        studentCount: 0,
      })),
    };
  }

  // 3. Fallback to "Subject" DocType
  const subjList = await getV3DocList<{
    name: string;
    subject_name?: string;
    subject_code?: string;
  }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Subject",
    fields: ["name", "subject_name", "subject_code"],
    limitPageLength: 30,
  });

  if (subjList.ok && subjList.data.length > 0) {
    return {
      ok: true,
      data: subjList.data.map((s) => ({
        id: s.name,
        doctypeName: s.name,
        subjectName: s.subject_name || s.name,
        subjectCode: s.subject_code || s.name,
        sectionName: "V3 Subject",
        schoolYear: "",
        teacherName: input.email,
        schedule: "DocType Subject",
        studentCount: 0,
      })),
    };
  }

  // 4. Fallback to Silid V3 Drizzle `class_card` records
  const dbClasses = await getClasses();
  if (dbClasses.length > 0) {
    return {
      ok: true,
      data: dbClasses.map((row) => ({
        id: row.id,
        doctypeName: row.id,
        subjectName: row.subjectName,
        subjectCode: row.subjectCode,
        sectionName: row.sectionName,
        schoolYear: row.period,
        teacherName: input.email,
        schedule: row.period || "Silid V3",
        studentCount: 0,
      })),
    };
  }

  return {
    ok: false,
    error: sgList.ok ? "No V3 classes found on this school site." : sgList.error,
  };
}
