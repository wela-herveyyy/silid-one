import type { classCard } from "@/drizzle/schema";

export type ClassCardRow = typeof classCard.$inferSelect;
export type ClassCardInsert = typeof classCard.$inferInsert;

export type ClassCardSummary = {
  id: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  period: string;
  color: string;
  bgImage: string | null;
  archive: boolean;
  meetingLink: string | null;
};

export type ClassResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
