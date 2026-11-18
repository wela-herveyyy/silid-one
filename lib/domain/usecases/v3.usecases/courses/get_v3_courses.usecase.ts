import { asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { database } from "@/database";
import {
  course,
  courseLevelTag,
  courseTopic,
  lessons,
  levelTags,
  topics,
  users,
} from "@/drizzle/schema";
import type { ExternalCourseItem } from "@/types/lms";

/** Loads published and draft enrichment `course` + `lessons` rows from Silid V3 MySQL. */
export async function getV3CoursesFromMysql(): Promise<ExternalCourseItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");

  try {
    const courseRows = await database
      .select({
        id: course.id,
        title: course.title,
        description: course.description,
        color: course.color,
        status: course.status,
        referenceUrl: course.referenceUrl,
        createdAt: course.createdAt,
        authorName: users.name,
      })
      .from(course)
      .leftJoin(users, eq(course.createdBy, users.id))
      .orderBy(desc(course.createdAt))
      .limit(60);

    if (courseRows.length === 0) return [];
    const courseIds = courseRows.map((c) => c.id);

    const [lessonRows, levelRows, topicRows] = await Promise.all([
      database
        .select({
          id: lessons.id,
          courseId: lessons.courseId,
          header: lessons.header,
          description: lessons.description,
          order: lessons.order,
        })
        .from(lessons)
        .where(inArray(lessons.courseId, courseIds))
        .orderBy(asc(lessons.order)),
      database
        .select({
          courseId: courseLevelTag.courseId,
          name: levelTags.name,
        })
        .from(courseLevelTag)
        .innerJoin(levelTags, eq(courseLevelTag.levelTagId, levelTags.id))
        .where(inArray(courseLevelTag.courseId, courseIds)),
      database
        .select({
          courseId: courseTopic.courseId,
          name: topics.name,
        })
        .from(courseTopic)
        .innerJoin(topics, eq(courseTopic.topicId, topics.id))
        .where(inArray(courseTopic.courseId, courseIds)),
    ]);

    const lessonsByCourse = new Map<string, ExternalCourseItem["lessons"]>();
    for (const l of lessonRows) {
      const list = lessonsByCourse.get(l.courseId) ?? [];
      list.push({
        id: l.id,
        weekLabel: `Lesson ${l.order || list.length + 1}`,
        title: l.header,
        summary: l.description.slice(0, 140),
        durationMinutes: 25,
        contentParagraphs: l.description ? [l.description] : [],
      });
      lessonsByCourse.set(l.courseId, list);
    }

    const levelByCourse = new Map<string, string>();
    for (const lv of levelRows) {
      if (!levelByCourse.has(lv.courseId)) {
        levelByCourse.set(lv.courseId, lv.name);
      }
    }

    const topicsByCourse = new Map<string, string[]>();
    for (const tp of topicRows) {
      const list = topicsByCourse.get(tp.courseId) ?? [];
      list.push(tp.name);
      topicsByCourse.set(tp.courseId, list);
    }

    return courseRows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      gradeLabel: levelByCourse.get(c.id) || "All Levels",
      topicTags: topicsByCourse.get(c.id) ?? [],
      authorName: c.authorName || "Silid Partner",
      publishedAt: c.createdAt.slice(0, 10),
      status: c.status,
      referenceUrl: c.referenceUrl || "",
      accentColor: c.color || "#ea580c",
      lessons: lessonsByCourse.get(c.id) ?? [],
    }));
  } catch (error) {
    console.error("[getV3CoursesFromMysql]", error);
    return [];
  }
}
