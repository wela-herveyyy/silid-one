import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import {
  activities,
  attendance,
  chatbox,
  chatboxMessages,
  classWorkCategory,
  participants,
  post,
  postComment,
  questions,
  sections,
  studentActivity,
  term,
  users,
} from "@/drizzle/schema";
import { getActivitiesByClass } from "@/lib/domain/usecases/activities/get_activities.usecase";
import type { ActivitySummary } from "@/lib/entities/activities.type";
import type {
  AttendanceEntry,
  ChatMessageItem,
  ClassActivityItem,
  ClassMemberItem,
  ClassPostItem,
  ClassworkComponentItem,
  QuizQuestionItem,
  SubmissionScoreRow,
} from "@/types/lms";

function formatShortDate(raw: string | null): string {
  if (!raw) return "Recently";
  return raw.slice(0, 10);
}

/**
 * Reads `post` + `post_comment` + `users` for a `classCardId`
 * (matching `silid-v3`'s `GetPostsByClassCardIdUseCase`).
 */
export async function getV3ClassPosts(classCardId: string): Promise<ClassPostItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts", `posts-${classCardId}`);

  try {
    const postRows = await database
      .select({
        id: post.id,
        classCardId: post.classCardId,
        message: post.message,
        userPostType: post.userPostType,
        createdAt: post.createdAt,
        authorName: users.name,
      })
      .from(post)
      .leftJoin(users, eq(post.createdBy, users.id))
      .where(and(eq(post.classCardId, classCardId), eq(post.archive, 0)))
      .orderBy(desc(post.createdAt))
      .limit(40);

    if (postRows.length === 0) return [];

    const postIds = postRows.map((p) => p.id);
    const commentRows = await database
      .select({
        id: postComment.id,
        postId: postComment.postId,
        message: postComment.message,
        createdAt: postComment.createdAt,
        authorName: users.name,
      })
      .from(postComment)
      .leftJoin(users, eq(postComment.createdBy, users.id))
      .where(inArray(postComment.postId, postIds));

    const commentsByPost = new Map<string, ClassPostItem["comments"]>();
    for (const c of commentRows) {
      const list = commentsByPost.get(c.postId) ?? [];
      list.push({
        id: c.id,
        authorName: c.authorName || "Member",
        body: c.message || "",
        createdAtLabel: formatShortDate(c.createdAt),
      });
      commentsByPost.set(c.postId, list);
    }

    return postRows.map((p) => ({
      id: p.id,
      classId: p.classCardId,
      authorName: p.authorName || "Teacher",
      authorRole: p.userPostType === "student" ? "Student" : "Teacher",
      createdAtLabel: formatShortDate(p.createdAt),
      body: p.message || "",
      comments: commentsByPost.get(p.id) ?? [],
    }));
  } catch (error) {
    console.error("[getV3ClassPosts]", error);
    return [];
  }
}

/**
 * Reads `class_work_category` + `term` for a `classCardId`
 * (matching `silid-v3`'s `GetClassWorkComponentByClassCardIdUseCase`).
 */
export async function getV3ClassWorkComponents(
  classCardId: string,
): Promise<ClassworkComponentItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("components", `components-${classCardId}`);

  try {
    const [catRows, termRows] = await Promise.all([
      database
        .select()
        .from(classWorkCategory)
        .where(and(eq(classWorkCategory.classCardId, classCardId), eq(classWorkCategory.archive, 0))),
      database
        .select()
        .from(term)
        .where(and(eq(term.classCardId, classCardId), eq(term.archive, 0)))
        .limit(1),
    ]);

    const termName = termRows[0]?.name || "1st Term";
    return catRows.map((c) => ({
      id: c.id,
      termName,
      categoryName: c.name,
      weightPercent: Math.round(Number(c.weight) || 0),
      active: c.archive === 0,
    }));
  } catch (error) {
    console.error("[getV3ClassWorkComponents]", error);
    return [];
  }
}

/** Reads `participants` inner-joined with `users` for a `classCardId`. */
export async function getV3ClassMembers(classCardId: string): Promise<ClassMemberItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("members", `members-${classCardId}`);

  try {
    const rows = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        enabled: participants.enabled,
        hasPermit: participants.hasPermit,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(eq(participants.classCardId, classCardId));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role === "teacher" || r.role === "admin" || r.role === "owner" ? "Teacher" : "Student",
      status: r.enabled === 1 ? "Active" : "Invited",
      badgesEarned: 0,
      enabled: r.enabled === 1,
      permit: r.hasPermit === 1,
    }));
  } catch (error) {
    console.error("[getV3ClassMembers]", error);
    return [];
  }
}

export async function getV3ClassAttendance(
  classCardId: string,
  members: ClassMemberItem[],
): Promise<AttendanceEntry[]> {
  try {
    const attRows = await database
      .select({
        userId: attendance.userId,
        type: attendance.type,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .where(eq(attendance.classCardId, classCardId))
      .orderBy(desc(attendance.createdAt))
      .limit(200);

    const latestByStudent = new Map<string, "in" | "out">();
    for (const row of attRows) {
      if (!latestByStudent.has(row.userId)) {
        latestByStudent.set(row.userId, row.type);
      }
    }

    return members
      .filter((m) => m.role === "Student")
      .map((student) => {
        const log = latestByStudent.get(student.id);
        return {
          studentId: student.id,
          studentName: student.name,
          status: log === "out" ? "absent" : "present",
        };
      });
  } catch (error) {
    console.error("[getV3ClassAttendance]", error);
    return [];
  }
}

export async function getV3ClassSubmissions(classCardId: string): Promise<SubmissionScoreRow[]> {
  try {
    const rows = await database
      .select({
        studentId: users.id,
        studentName: users.name,
        maxScore: activities.points,
        score: studentActivity.score,
        submitted: studentActivity.submitted,
        graded: studentActivity.graded,
        submitDate: studentActivity.submitDate,
        sectionName: sections.name,
      })
      .from(studentActivity)
      .innerJoin(activities, eq(studentActivity.activityId, activities.id))
      .innerJoin(users, eq(studentActivity.userId, users.id))
      .leftJoin(participants, and(eq(participants.userId, users.id), eq(participants.classCardId, classCardId)))
      .leftJoin(sections, eq(sections.id, classCardId))
      .where(eq(activities.classCardId, classCardId))
      .orderBy(desc(studentActivity.submitDate))
      .limit(100);

    return rows.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      sectionName: r.sectionName || "Section",
      submittedAt: r.submitDate ? formatShortDate(r.submitDate) : "—",
      score: r.score ?? 0,
      maxScore: r.maxScore || 100,
      status: r.graded === 1 ? "Graded" : r.submitted === 1 ? "Submitted" : "Missing",
    }));
  } catch (error) {
    console.error("[getV3ClassSubmissions]", error);
    return [];
  }
}

export async function getV3ClassChatMessages(
  classCardId: string,
  currentUserEmail: string,
): Promise<ChatMessageItem[]> {
  try {
    const boxRows = await database
      .select({ id: chatbox.id })
      .from(chatbox)
      .where(and(eq(chatbox.classCardId, classCardId), eq(chatbox.archive, 0)))
      .limit(1);

    const boxId = boxRows[0]?.id;
    if (!boxId) return [];

    const msgRows = await database
      .select({
        id: chatboxMessages.id,
        message: chatboxMessages.message,
        createdAt: chatboxMessages.createdAt,
        senderName: users.name,
        senderEmail: users.email,
      })
      .from(chatboxMessages)
      .leftJoin(users, eq(chatboxMessages.senderId, users.id))
      .where(eq(chatboxMessages.chatBoxId, boxId))
      .orderBy(asc(chatboxMessages.createdAt))
      .limit(100);

    const cleanMe = currentUserEmail.trim().toLowerCase();
    return msgRows.map((m) => ({
      id: m.id,
      senderName: m.senderName || "Class Member",
      senderRole: m.senderEmail?.toLowerCase() === cleanMe ? "user" : "peer",
      timestamp: formatShortDate(m.createdAt),
      text: m.message || "",
    }));
  } catch (error) {
    console.error("[getV3ClassChatMessages]", error);
    return [];
  }
}

export function mapActivitySummaryToItem(
  row: ActivitySummary,
  classId: string,
  childQuestions: QuizQuestionItem[] = [],
): ClassActivityItem {
  const actType: ClassActivityItem["type"] =
    row.type === "quiz" ? "quiz" : row.type === "assignment" ? "assignment" : "material";
  const categoryName =
    actType === "quiz" ? "Quiz" : actType === "assignment" ? "Assignment" : "Materials";
  return {
    id: row.id,
    classId: row.classCardId || classId,
    type: actType,
    title: row.title,
    topic: row.topic || categoryName,
    termName: "Active Term",
    categoryName,
    publishedDate: formatShortDate(row.publishedDate),
    deadline: row.deadline ? formatShortDate(row.deadline) : null,
    noDeadline: !row.deadline,
    points: row.points,
    description: row.topic || "",
    submittedCount: 0,
    totalStudents: 0,
    deleted: row.archive,
    questions: childQuestions,
  };
}

export async function getV3ClassWorkspaceBundle(
  classCardId: string,
  currentUserEmail = "",
) {
  const [posts, components, members, rawActivities, submissions, classChat] = await Promise.all([
    getV3ClassPosts(classCardId),
    getV3ClassWorkComponents(classCardId),
    getV3ClassMembers(classCardId),
    getActivitiesByClass(classCardId),
    getV3ClassSubmissions(classCardId),
    getV3ClassChatMessages(classCardId, currentUserEmail),
  ]);

  const actIds = rawActivities.map((a) => a.id);
  const questionsByAct = new Map<string, QuizQuestionItem[]>();
  if (actIds.length > 0) {
    const qRows = await database
      .select()
      .from(questions)
      .where(inArray(questions.activitiesId, actIds))
      .orderBy(asc(questions.order));
    for (const q of qRows) {
      if (!q.activitiesId) continue;
      const list = questionsByAct.get(q.activitiesId) ?? [];
      list.push({
        id: q.id,
        type:
          q.type === "true-false" ||
          q.type === "identification" ||
          q.type === "essay" ||
          q.type === "enumeration" ||
          q.type === "matching" ||
          q.type === "attachments"
            ? q.type
            : "multiple-choice",
        prompt: q.description || "",
        points: q.points ?? 1,
        choices: Array.isArray(q.choices) ? (q.choices as unknown[]).map(String) : undefined,
        correctAnswer:
          typeof q.answer === "string"
            ? q.answer
            : Array.isArray(q.answer) && q.answer.length > 0
              ? String(q.answer[0])
              : "",
        correctAnswers: Array.isArray(q.answer) ? (q.answer as unknown[]).map(String) : undefined,
      });
      questionsByAct.set(q.activitiesId, list);
    }
  }

  const attendanceList = await getV3ClassAttendance(classCardId, members);
  const mappedActivities = rawActivities.map((a) =>
    mapActivitySummaryToItem(a, classCardId, questionsByAct.get(a.id) ?? []),
  );

  return {
    posts,
    components,
    members,
    activities: mappedActivities,
    attendance: attendanceList,
    submissions,
    classChat,
  };
}
