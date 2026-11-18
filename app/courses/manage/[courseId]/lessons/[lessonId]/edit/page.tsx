"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function EditCourseLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { externalCourses } = useLmsSession();
  const course = externalCourses.find((c) => c.id === courseId) ?? externalCourses[0];
  const lesson = course.lessons.find((l) => l.id === lessonId) ?? course.lessons[0];

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [summary, setSummary] = useState(lesson?.summary ?? "");
  const [body, setBody] = useState(lesson?.contentParagraphs.join("\n\n") ?? "");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/courses/manage/${course.id}/edit`);
  };

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/courses/manage/${course.id}/edit`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          &lt; Back to {course.title}
        </Link>

        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Lesson Content Editor
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Edit Lesson Content</h1>
          </div>

          <div>
            <label htmlFor="les-title" className="block text-xs font-bold text-gray-700">
              Lesson Title
            </label>
            <input
              id="les-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="les-summary" className="block text-xs font-bold text-gray-700">
              Summary
            </label>
            <input
              id="les-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Lesson Content</label>
            <RichTextEditor
              variant="full"
              value={body}
              onChange={setBody}
              placeholder="Write lesson content..."
              ariaLabel="Lesson content HTML editor"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Link
              href={`/courses/manage/${course.id}/edit`}
              className="inline-flex h-10 items-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </DashboardTemplate>
  );
}
