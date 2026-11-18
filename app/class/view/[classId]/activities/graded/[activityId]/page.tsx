"use client";

import { CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ActivityGradedPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities, submissions } = useLmsSession();
  const activity = activities.find((a) => a.id === activityId) ?? activities[0];
  const sample = submissions[0];

  if (!activity) {
    return (
      <ClassWorkspaceTemplate classId={classId}>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading graded summary…
        </div>
      </ClassWorkspaceTemplate>
    );
  }

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/class/view/${classId}/activities`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          &lt; Back to Activities
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100">
                Graded Summary
              </p>
              <h2 className="mt-1 text-2xl font-bold">{activity.title}</h2>
              <p className="mt-1 text-xs text-orange-100">{sample.studentName}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-extrabold text-white">
                {sample.score}/{sample.maxScore}
              </p>
              <p className="text-[11px] font-medium text-orange-100">Final Score</p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 text-sm text-green-800">
              <span className="inline-flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Graded Submission
              </span>
              <span className="font-mono text-xs">{sample.submittedAt}</span>
            </div>

            {sample.feedback ? (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Teacher Feedback
                </p>
                <p className="mt-1.5 text-sm text-gray-800">{sample.feedback}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
