"use client";

import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function GradeSchoolCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { externalCourses } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];
  if (!course) {
    return (
      <DashboardTemplate>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading course…
        </div>
      </DashboardTemplate>
    );
  }
  const color = course.accentColor || "#ea580c";

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <Link
          href="/courses/grade-school"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Grade School</span>
        </Link>

        <div className="rounded-[24px] border-2 border-gray-600 bg-orange-50/70 p-6 shadow-[5px_5px_0px_0px_#4b5563] sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-gray-400 bg-white px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-800">
              {course.gradeLabel}
            </span>
            {course.topicTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">{course.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{course.description}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-gray-900">Lessons</h2>
          {course.lessons.length === 0 ? (
            <div className="rounded-2xl border-2 border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              No lessons added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {course.lessons.map((lesson, idx) => (
                <Link
                  key={lesson.id}
                  href={`/courses/grade-school/${course.id}/lessons/${lesson.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-gray-600 bg-white p-4 shadow-[4px_4px_0px_0px_#4b5563] transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:shadow-[5px_5px_0px_0px_#f97316]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-300 font-extrabold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                        {lesson.weekLabel}
                      </p>
                      <p className="font-bold text-gray-900">{lesson.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.durationMinutes} min
                    </span>
                    <ArrowRight className="h-4 w-4 text-orange-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2 text-xs font-medium text-gray-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.lessons.length} interactive modules</span>
          </div>
        </section>
      </div>
    </DashboardTemplate>
  );
}
