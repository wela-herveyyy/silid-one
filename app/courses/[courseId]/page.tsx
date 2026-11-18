"use client";

import { ArrowLeft, ArrowRight, BookOpen, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/atoms/Avatar";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { externalCourses, role } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];
  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf6ee] text-sm text-gray-500">
        Loading course…
      </div>
    );
  }
  const color = course.accentColor || "#ea580c";

  return (
    <div className="min-h-screen bg-[#fdf6ee]">
      {/* Top Bar matching CourseDetailView.vue / vue_course_detail.png */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-orange-100 bg-white px-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span>Courses</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            {role}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
            <HelpCircle className="h-4 w-4" />
            Help
          </span>
          <Avatar name={course.authorName} size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-orange-200/80 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {course.gradeLabel}
            </span>
            {course.topicTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">{course.description}</p>
          <p className="mt-4 text-xs font-medium text-gray-400">
            {course.authorName} · Published {course.publishedAt}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Course Lessons</h2>
          {course.lessons.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              No lessons added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {course.lessons.map((lesson, idx) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.id}/lessons/${lesson.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                        {lesson.weekLabel}
                      </p>
                      <p className="mt-0.5 text-base font-bold text-gray-900">{lesson.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{lesson.summary}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.durationMinutes} min
                    </span>
                    <ArrowRight className="h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{course.lessons.length} lessons available</span>
        </div>
      </main>
    </div>
  );
}
