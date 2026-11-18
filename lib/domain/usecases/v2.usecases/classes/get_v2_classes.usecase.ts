import { getV2Document } from "@/lib/domain/usecases/v2.usecases/doctype/get_v2_doctype_document.usecase";
import { getV2DocList } from "@/lib/domain/usecases/v2.usecases/doctype/get_v2_doctype_list.usecase";
import {
  extractV2ClassMetadataAndRoster,
  type RawV2ClassDoc,
} from "@/lib/domain/usecases/v2.usecases/classes/extract_v2_class_payload.usecase";
import type { FrappeClassItem, FrappeDocResult } from "@/lib/entities/frappe.type";

export type V2ClassWithRawDoc = {
  card: FrappeClassItem;
  rawDoc: RawV2ClassDoc;
};

/**
 * Fetches V2 `"Class"` DocTypes + full hydrated documents (students, schedules, teacher)
 * over HTTP (`Cookie: sid=...`) and maps them to `FrappeClassItem[]`.
 */
export async function getV2ClassesWithRawDocs(input: {
  baseUrl: string;
  sid: string;
  email: string;
}): Promise<FrappeDocResult<V2ClassWithRawDoc[]>> {
  const listRes = await getV2DocList<{ name: string; section?: string; school_year?: string }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Class",
    fields: ["name", "section", "school_year"],
    limitPageLength: 30,
  });

  if (!listRes.ok || listRes.data.length === 0) {
    return listRes.ok
      ? { ok: true, data: [] }
      : { ok: false, error: listRes.error };
  }

  const docs = await Promise.all(
    listRes.data.slice(0, 15).map((item) =>
      getV2Document<RawV2ClassDoc>({
        baseUrl: input.baseUrl,
        sid: input.sid,
        doctype: "Class",
        name: item.name,
      }),
    ),
  );

  const output: V2ClassWithRawDoc[] = [];
  for (const docRes of docs) {
    if (!docRes.ok) continue;
    const doc = docRes.data;
    const { sectionName, schedules, studentCount } = extractV2ClassMetadataAndRoster(doc, "v2");
    const leadTeacher = doc.teacher || doc.adviser || input.email;

    if (schedules.length === 0) {
      output.push({
        rawDoc: doc,
        card: {
          id: doc.name,
          doctypeName: doc.name,
          subjectName: doc.class_name || doc.title || doc.name,
          subjectCode: doc.name,
          sectionName,
          schoolYear: doc.school_year || "",
          teacherName: leadTeacher,
          schedule: doc.time_schedule || "Class Roster",
          studentCount,
        },
      });
    } else {
      for (const row of schedules) {
        const timeLabel = [row.day, row.start_time, row.end_time].filter(Boolean).join(" ");
        output.push({
          rawDoc: doc,
          card: {
            id: `${doc.name}-${row.subject || "subj"}-${output.length}`,
            doctypeName: doc.name,
            subjectName: row.subject_name || row.subject || doc.class_name || doc.name,
            subjectCode: row.subject_code || row.subject || doc.name,
            sectionName,
            schoolYear: doc.school_year || "",
            teacherName: row.teacher_name || row.teacher || leadTeacher,
            schedule: timeLabel || "Scheduled",
            studentCount,
          },
        });
      }
    }
  }

  return { ok: true, data: output };
}

/**
 * Fetches V2 school classes over HTTP (`Cookie: sid=...`) via `"Class"` (`get_list` + `get_document`),
 * with `"Student Group"` and `"Subject"` DocType fallbacks.
 */
export async function getV2ClassesWithSid(input: {
  baseUrl: string;
  sid: string;
  email: string;
}): Promise<FrappeDocResult<FrappeClassItem[]>> {
  const fullRes = await getV2ClassesWithRawDocs(input);
  if (fullRes.ok && fullRes.data.length > 0) {
    return { ok: true, data: fullRes.data.map((d) => d.card) };
  }

  const sgRes = await getV2DocList<{
    name: string;
    student_group_name?: string;
    course?: string;
    academic_year?: string;
    batch?: string;
  }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Student Group",
    fields: ["name", "student_group_name", "course", "academic_year", "batch"],
    limitPageLength: 30,
  });

  if (sgRes.ok && sgRes.data.length > 0) {
    return {
      ok: true,
      data: sgRes.data.map((sg) => ({
        id: sg.name,
        doctypeName: sg.name,
        subjectName: sg.course || sg.student_group_name || sg.name,
        subjectCode: sg.name,
        sectionName: sg.batch || sg.student_group_name || sg.name,
        schoolYear: sg.academic_year || "",
        teacherName: input.email,
        schedule: "Active Group",
        studentCount: 0,
      })),
    };
  }

  const subjRes = await getV2DocList<{
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

  if (subjRes.ok && subjRes.data.length > 0) {
    return {
      ok: true,
      data: subjRes.data.map((s) => ({
        id: s.name,
        doctypeName: s.name,
        subjectName: s.subject_name || s.name,
        subjectCode: s.subject_code || s.name,
        sectionName: "Assigned Subject",
        schoolYear: "",
        teacherName: input.email,
        schedule: "DocType Subject",
        studentCount: 0,
      })),
    };
  }

  return {
    ok: false,
    error: fullRes.ok ? "No V2 classes found on this school site." : fullRes.error,
  };
}
