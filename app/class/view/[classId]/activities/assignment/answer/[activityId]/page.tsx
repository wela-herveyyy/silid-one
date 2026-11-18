"use client";

import { Award, Calendar, CheckCircle2, Clock, Info, Upload } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function AnswerAssignmentPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities } = useLmsSession();
  const activity =
    activities.find((a) => a.id === activityId) ??
    activities.find((a) => a.type === "assignment") ??
    activities[0];

  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState("reflection-paper-draft.pdf");
  const [submitted, setSubmitted] = useState(false);

  if (!activity) {
    return (
      <ClassWorkspaceTemplate classId={classId}>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading assignment…
        </div>
      </ClassWorkspaceTemplate>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/class/view/${classId}/activities`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          &lt; Back to Activities
        </Link>

        {/* Header matching AnswerAssignmentView.vue 1:1 */}
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-orange-400">
            {submitted ? "Review Submission" : "Submit Assignment"}
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {activity.title}
            </h1>
            {submitted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                <Clock className="h-3.5 w-3.5" />
                Awaiting Grade
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Published {activity.publishedDate.replace("T", " ")}
            </span>
            {activity.deadline ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Due {activity.deadline.replace("T", " ")}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              {activity.points} pts
            </span>
          </div>
        </div>

        {/* Instructions Section Card matching AnswerAssignmentView.vue */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
                Instructions
              </p>
              <h2 className="text-base font-bold text-gray-900">What you need to do</h2>
            </div>
          </header>
          <div className="p-6">
            {activity.description ? (
              <RichHtmlContent html={activity.description} />
            ) : (
              <p className="text-sm text-gray-500">No instructions provided.</p>
            )}
          </div>
        </section>

        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50/70 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="mt-3 text-base font-bold text-gray-900">Assignment Submitted</h3>
            <p className="mt-1 font-mono text-xs text-gray-600">{fileName}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
          >
            <div>
              <span className="block text-sm font-bold text-gray-900">Your Work</span>
              <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm transition-colors hover:border-orange-400">
                <span className="flex items-center gap-2 text-gray-600">
                  <Upload className="h-4 w-4 text-orange-500" />
                  <span className="font-mono text-xs">{fileName}</span>
                </span>
                <span className="text-xs font-semibold text-orange-600">Choose file</span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) setFileName(picked.name);
                  }}
                />
              </label>
            </div>

            <div>
              <span className="mb-2 block text-sm font-bold text-gray-900">
                Submission Note
              </span>
              <RichTextEditor
                variant="comment"
                value={note}
                onChange={setNote}
                placeholder="Optional message for your teacher..."
                ariaLabel="Assignment submission note editor"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                Submit Assignment
              </button>
            </div>
          </form>
        )}
      </div>
    </ClassWorkspaceTemplate>
  );
}
