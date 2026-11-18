import { getV1DocList } from "@/lib/domain/usecases/v1.usecases/doctype/get_v1_doctype_document.usecase";
import type { FrappeClassItem, FrappeDocResult } from "@/lib/entities/frappe.type";

/** Legacy V1 class list fetcher via Frappe DocType `"Class"` / `"Course"` (`Cookie: sid=...`). */
export async function getV1ClassesWithSid(input: {
  baseUrl: string;
  sid: string;
  email: string;
}): Promise<FrappeDocResult<FrappeClassItem[]>> {
  const listRes = await getV1DocList<{ name: string; title?: string; section?: string }>({
    baseUrl: input.baseUrl,
    sid: input.sid,
    doctype: "Class",
    fields: ["name", "title", "section"],
    limitPageLength: 30,
  });

  if (!listRes.ok) {
    return listRes;
  }

  return {
    ok: true,
    data: listRes.data.map((row) => ({
      id: row.name,
      doctypeName: row.name,
      subjectName: row.title || row.name,
      subjectCode: row.name,
      sectionName: row.section || "V1 Class",
      schoolYear: "",
      teacherName: input.email,
      schedule: "V1",
      studentCount: 0,
    })),
  };
}
