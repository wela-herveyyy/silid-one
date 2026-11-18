"use client";

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function GradeSchoolLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { externalCourses } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];
  const lesson = course.lessons.find((l) => l.id === lessonId) ?? course.lessons[0];

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <Link
          href={`/courses/grade-school/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {course.title}</span>
        </Link>

        <article className="rounded-[24px] border-2 border-gray-600 bg-white p-6 shadow-[5px_5px_0px_0px_#4b5563] sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              {lesson?.weekLabel ?? "Module 1"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {lesson?.durationMinutes ?? 25} min
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            {lesson?.title ?? "Lesson Module"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{lesson?.summary}</p>

          <div className="mt-6 space-y-4 border-t-2 border-dashed border-gray-200 pt-5 text-sm leading-relaxed text-gray-700">
            {(lesson?.contentParagraphs ?? ["Explore this guided module with your class."]).map(
              (p, i) => (
                <p key={i}>{p}</p>
              ),
            )}
          </div>
        </article>
      </div>
    </DashboardTemplate>
  );
}
