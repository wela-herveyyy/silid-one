"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function CourseLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { externalCourses, role } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];
  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessonIndex >= 0 ? course.lessons[lessonIndex] : course.lessons[0];
  const progress =
    course.lessons.length > 0
      ? Math.round(((Math.max(0, lessonIndex) + 1) / course.lessons.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f5e8d8]">
      {/* Top Lesson Header matching LessonView.vue / vue_course_lesson.png 1:1 */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-orange-100 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Course
            </p>
            <p className="text-xs font-bold text-gray-900">
              {lesson ? lesson.title : "This Lesson"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500">{progress}%</span>
          </div>
          <span className="text-xs font-semibold text-gray-700">{role}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {lesson ? (
          <article className="overflow-hidden rounded-2xl border border-orange-200/70 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-orange-500" />
            <div className="p-8 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                  Lesson Module
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                  {lesson.weekLabel}
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                  {course.gradeLabel}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-sm text-gray-500">{lesson.summary}</p>

              <div className="space-y-4 border-t border-gray-100 pt-5 text-sm leading-relaxed text-gray-700">
                {lesson.contentParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </article>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-orange-200/70 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-orange-500" />
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900">Lesson</h1>
              <p className="mt-2 text-sm text-gray-500">Content coming soon.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
