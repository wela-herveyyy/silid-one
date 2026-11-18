"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CourseFormOrganism } from "@/components/organisms/CourseFormOrganism";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { externalCourses } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];

  if (!course) {
    return (
      <DashboardTemplate>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading course editor…
        </div>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate>
      <div className="space-y-8 pb-12">
        <CourseFormOrganism existing={course} />

        {course.lessons.length > 0 ? (
          <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Edit Lessons</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {course.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center justify-between py-3.5 text-sm">
                  <span className="font-medium text-gray-900">
                    <span className="mr-2 font-mono text-xs font-semibold text-orange-500">
                      {lesson.weekLabel}
                    </span>
                    {lesson.title}
                  </span>
                  <Link
                    href={`/courses/manage/${course.id}/lessons/${lesson.id}/edit`}
                    className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                  >
                    Open Editor
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DashboardTemplate>
  );
}
