import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { database } from "@/database";
import { activities, questions } from "@/drizzle/schema";
import { nowMysqlDatetime } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type {
  ClassActivityItem,
  QuestionType,
  QuizQuestionItem,
} from "@/types/lms";

function parseDbQuestionType(raw: string | null): QuestionType {
  if (
    raw === "multiple-choice" ||
    raw === "true-false" ||
    raw === "identification" ||
    raw === "essay" ||
    raw === "enumeration" ||
    raw === "matching" ||
    raw === "attachments"
  ) {
    return raw;
  }
  return "multiple-choice";
}

function mapQuestionRow(row: typeof questions.$inferSelect): QuizQuestionItem {
  const choices = Array.isArray(row.choices)
    ? (row.choices as unknown[]).map((c) => String(c))
    : undefined;
  const answerRaw = row.answer;
  const correctAnswers = Array.isArray(answerRaw)
    ? (answerRaw as unknown[]).map((a) => String(a))
    : undefined;
  const correctAnswer =
    typeof answerRaw === "string"
      ? answerRaw
      : Array.isArray(answerRaw) && answerRaw.length > 0
        ? String(answerRaw[0])
        : "";

  return {
    id: row.id,
    type: parseDbQuestionType(row.type),
    prompt: row.description || "Untitled question",
    points: row.points ?? 1,
    choices,
    correctAnswer,
    correctAnswers,
    shuffleChoices: Boolean(row.shuffleChoicesDuringTest),
    ignorePunctuation: !row.checkForPunctuationsAndSpecialChar,
    ignoreCase: !row.checkForCaseSensitiveAnswers,
  };
}

function mapActivityRow(
  row: typeof activities.$inferSelect,
  childQuestions: QuizQuestionItem[],
): ClassActivityItem {
  const actType: ClassActivityItem["type"] =
    row.type === "quiz" ? "quiz" : row.type === "assignment" ? "assignment" : "material";
  const categoryName =
    actType === "quiz" ? "Quiz" : actType === "assignment" ? "Assignment" : "Materials";

  return {
    id: row.id,
    classId: row.classCardId || "",
    type: actType,
    title: row.title,
    topic: row.topic || categoryName,
    termName: "Active Term",
    categoryName,
    publishedDate: (row.publishedDate || "").slice(0, 10),
    deadline: row.deadline ? row.deadline.slice(0, 10) : null,
    noDeadline: !row.deadline,
    points: row.points,
    description: row.topic || "",
    submittedCount: 0,
    totalStudents: 0,
    deleted: Boolean(row.archive),
    questions: childQuestions,
  };
}

export async function getV3BankActivities(): Promise<ClassActivityItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("activities", "activity-bank");

  try {
    const actRows = await database
      .select()
      .from(activities)
      .where(and(eq(activities.bank, 1), eq(activities.archive, 0)))
      .orderBy(desc(activities.createdAt))
      .limit(40);

    if (actRows.length === 0) return [];
    const ids = actRows.map((a) => a.id);

    const qRows = await database
      .select()
      .from(questions)
      .where(inArray(questions.activitiesId, ids))
      .orderBy(asc(questions.order));

    const qMap = new Map<string, QuizQuestionItem[]>();
    for (const q of qRows) {
      if (!q.activitiesId) continue;
      const list = qMap.get(q.activitiesId) ?? [];
      list.push(mapQuestionRow(q));
      qMap.set(q.activitiesId, list);
    }

    return actRows.map((a) => mapActivityRow(a, qMap.get(a.id) ?? []));
  } catch (error) {
    console.error("[getV3BankActivities]", error);
    return [];
  }
}

export async function getV3ActivityById(activityId: string): Promise<ClassActivityItem | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("activities", `activity-${activityId}`);

  try {
    const rows = await database
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const qRows = await database
      .select()
      .from(questions)
      .where(eq(questions.activitiesId, row.id))
      .orderBy(asc(questions.order));

    return mapActivityRow(row, qRows.map(mapQuestionRow));
  } catch (error) {
    console.error("[getV3ActivityById]", error);
    return null;
  }
}

export async function createV3Activity(input: {
  classCardId?: string | null;
  userId?: string | null;
  item: Omit<ClassActivityItem, "id" | "submittedCount" | "totalStudents">;
  bank?: boolean;
}): Promise<string> {
  const now = nowMysqlDatetime();
  const id = randomUUID();
  const dbType =
    input.item.type === "quiz"
      ? "quiz"
      : input.item.type === "assignment"
        ? "assignment"
        : "materials";

  const publishedDate =
    input.item.publishedDate && /^\d{4}-\d{2}-\d{2}/.test(input.item.publishedDate)
      ? `${input.item.publishedDate.slice(0, 10)} 00:00:00.000`
      : now;

  const deadline =
    input.item.deadline && /^\d{4}-\d{2}-\d{2}/.test(input.item.deadline)
      ? `${input.item.deadline.slice(0, 10)} 23:59:59.000`
      : now;

  await database.insert(activities).values({
    id,
    classCardId: input.classCardId || null,
    type: dbType,
    options: input.item.options ?? null,
    title: input.item.title.trim() || "Untitled Activity",
    points: Math.max(0, Number(input.item.points) || 0),
    publishedDate,
    deadline,
    topic: input.item.topic || input.item.description || null,
    bank: input.bank ? 1 : 0,
    archive: input.item.deleted ? 1 : 0,
    createdAt: now,
    updatedAt: now,
    createdBy: input.userId ?? null,
  });

  if (input.item.questions?.length) {
    await database.insert(questions).values(
      input.item.questions.map((q, idx) => ({
        id: randomUUID(),
        activitiesId: id,
        description: q.prompt,
        points: q.points ?? 1,
        type: q.type,
        checkForPunctuationsAndSpecialChar: q.ignorePunctuation ? 0 : 1,
        checkForCaseSensitiveAnswers: q.ignoreCase ? 0 : 1,
        shuffleChoicesDuringTest: q.shuffleChoices ? 1 : 0,
        choices: q.choices ?? null,
        answer: q.correctAnswers?.length ? q.correctAnswers : q.correctAnswer || null,
        order: idx,
        bank: input.bank ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  updateTag("activities");
  updateTag("activity-bank");
  return id;
}

export async function toggleV3ActivityArchive(activityId: string, deleted: boolean): Promise<void> {
  await database
    .update(activities)
    .set({
      archive: deleted ? 1 : 0,
      updatedAt: nowMysqlDatetime(),
    })
    .where(eq(activities.id, activityId));

  updateTag("activities");
  updateTag("activity-bank");
  updateTag(`activity-${activityId}`);
}
