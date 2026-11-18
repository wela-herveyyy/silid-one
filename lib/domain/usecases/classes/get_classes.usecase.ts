import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import type { ClassCardSummary } from "@/lib/entities/classes.type";
import { classCard, subjects, sections } from "@/drizzle/schema";

export async function getClasses(): Promise<ClassCardSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("classes");

  try {
    const rows = await database
      .select({
        id: classCard.id,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        sectionName: sections.name,
        period: classCard.period,
        color: classCard.color,
        bgImage: classCard.bgImage,
        archive: classCard.archive,
        meetingLink: classCard.meetingLink,
      })
      .from(classCard)
      .leftJoin(subjects, eq(classCard.subjectId, subjects.id))
      .leftJoin(sections, eq(classCard.sectionId, sections.id))
      .orderBy(desc(classCard.createdAt))
      .limit(50);

    return rows.map((row) => ({
      id: row.id,
      subjectName: row.subjectName ?? "Untitled Subject",
      subjectCode: row.subjectCode ?? "SUBJ",
      sectionName: row.sectionName ?? "General Section",
      period: row.period,
      color: row.color,
      bgImage: row.bgImage,
      archive: Boolean(row.archive),
      meetingLink: row.meetingLink,
    }));
  } catch (error) {
    console.error("[getClasses]", error);
    return [];
  }
}
