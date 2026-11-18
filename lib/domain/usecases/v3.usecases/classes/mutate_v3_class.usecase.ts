import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { database } from "@/database";
import {
  attendance,
  chatbox,
  chatboxMessages,
  classWorkCategory,
  notification,
  participants,
  post,
  postComment,
} from "@/drizzle/schema";
import { updateClassAppearance } from "@/lib/domain/usecases/classes/update_class.usecase";
import { nowMysqlDatetime } from "@/lib/domain/usecases/v3.usecases/reconcile/reconcile_helpers";
import type { AttendanceEntry, NotificationItem } from "@/types/lms";

export async function createV3Post(input: {
  classCardId: string;
  userId?: string | null;
  role: "student" | "teacher" | "admin" | "partner";
  message: string;
}) {
  const now = nowMysqlDatetime();
  const id = randomUUID();

  await database.insert(post).values({
    id,
    classCardId: input.classCardId,
    message: input.message.trim(),
    userPostType: input.role,
    createdBy: input.userId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  updateTag("posts");
  updateTag(`posts-${input.classCardId}`);
  return id;
}

export async function createV3PostComment(input: {
  postId: string;
  userId?: string | null;
  message: string;
}) {
  const now = nowMysqlDatetime();
  const id = randomUUID();

  await database.insert(postComment).values({
    id,
    postId: input.postId,
    message: input.message.trim(),
    createdBy: input.userId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  updateTag("posts");
  return id;
}

export async function createV3ClassWorkComponent(input: {
  classCardId: string;
  name: string;
  weightPercent: number;
}) {
  const now = nowMysqlDatetime();
  const id = randomUUID();

  await database.insert(classWorkCategory).values({
    id,
    classCardId: input.classCardId,
    name: input.name.trim(),
    weight: String(input.weightPercent),
    createdAt: now,
    updatedAt: now,
    archive: 0,
  });

  updateTag("components");
  updateTag(`components-${input.classCardId}`);
  return id;
}

export async function updateV3ClassWorkComponent(input: {
  id: string;
  classCardId?: string;
  name: string;
  weightPercent: number;
}) {
  await database
    .update(classWorkCategory)
    .set({
      name: input.name.trim(),
      weight: String(input.weightPercent),
      updatedAt: nowMysqlDatetime(),
    })
    .where(eq(classWorkCategory.id, input.id));

  updateTag("components");
  if (input.classCardId) updateTag(`components-${input.classCardId}`);
}

export async function deleteV3ClassWorkComponent(id: string, classCardId?: string) {
  await database
    .update(classWorkCategory)
    .set({ archive: 1, updatedAt: nowMysqlDatetime() })
    .where(eq(classWorkCategory.id, id));

  updateTag("components");
  if (classCardId) updateTag(`components-${classCardId}`);
}

export async function toggleV3ClassArchive(classCardId: string, archive: boolean) {
  return updateClassAppearance({ id: classCardId, archive });
}

export async function updateV3ParticipantFlag(input: {
  classCardId: string;
  userId: string;
  enabled?: boolean;
  hasPermit?: boolean;
}) {
  const patch: Partial<typeof participants.$inferInsert> = {
    updatedAt: nowMysqlDatetime(),
  };
  if (input.enabled !== undefined) patch.enabled = input.enabled ? 1 : 0;
  if (input.hasPermit !== undefined) patch.hasPermit = input.hasPermit ? 1 : 0;

  await database
    .update(participants)
    .set(patch)
    .where(
      and(
        eq(participants.classCardId, input.classCardId),
        eq(participants.userId, input.userId),
      ),
    );

  updateTag("members");
  updateTag(`members-${input.classCardId}`);
}

export async function upsertV3Attendance(input: {
  classCardId: string;
  studentId: string;
  status: AttendanceEntry["status"];
}) {
  const now = nowMysqlDatetime();
  await database.insert(attendance).values({
    id: randomUUID(),
    classCardId: input.classCardId,
    userId: input.studentId,
    type: input.status === "absent" ? "out" : "in",
    createdAt: now,
  });
}

export async function sendV3ClassChatMessage(input: {
  classCardId: string;
  senderId?: string | null;
  message: string;
}) {
  const now = nowMysqlDatetime();
  const boxRows = await database
    .select({ id: chatbox.id })
    .from(chatbox)
    .where(and(eq(chatbox.classCardId, input.classCardId), eq(chatbox.archive, 0)))
    .limit(1);

  let chatBoxId = boxRows[0]?.id;
  if (!chatBoxId) {
    chatBoxId = randomUUID();
    await database.insert(chatbox).values({
      id: chatBoxId,
      classCardId: input.classCardId,
      groupName: "Class Chat",
      createdAt: now,
      updatedAt: now,
      archive: 0,
    });
  }

  const msgId = randomUUID();
  await database.insert(chatboxMessages).values({
    id: msgId,
    chatBoxId,
    senderId: input.senderId ?? null,
    message: input.message.trim(),
    createdAt: now,
    updatedAt: now,
  });
  return msgId;
}

export async function getV3NotificationsForUser(userId?: string | null): Promise<NotificationItem[]> {
  if (!userId) return [];
  try {
    const rows = await database
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(20);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      createdAtLabel: (r.createdAt || "").slice(0, 10) || "Recently",
      isRead: Boolean(r.isRead),
    }));
  } catch (error) {
    console.error("[getV3NotificationsForUser]", error);
    return [];
  }
}

export async function markV3NotificationRead(notificationId: string) {
  await database
    .update(notification)
    .set({ isRead: 1, updatedAt: nowMysqlDatetime() })
    .where(eq(notification.id, notificationId));
}

export async function markAllV3NotificationsRead(userId: string) {
  await database
    .update(notification)
    .set({ isRead: 1, updatedAt: nowMysqlDatetime() })
    .where(eq(notification.userId, userId));
}
