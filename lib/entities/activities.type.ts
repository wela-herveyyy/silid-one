import type { activities } from "@/drizzle/schema";

export type ActivityRow = typeof activities.$inferSelect;
export type ActivityInsert = typeof activities.$inferInsert;

export type ActivitySummary = {
  id: string;
  classCardId: string | null;
  type: "assignment" | "quiz" | "materials";
  title: string;
  points: number;
  topic: string | null;
  publishedDate: string;
  deadline: string;
  archive: boolean;
  bank: boolean;
};

export type ActivityResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
