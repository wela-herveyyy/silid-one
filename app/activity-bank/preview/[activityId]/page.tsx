"use client";

import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import { getActivityPreviewAction } from "@/lib/domain/actions/lms_mutations.actions";
import type { ClassActivityItem } from "@/types/lms";

export default function BankActivityPreviewPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const { activities } = useLmsSession();
  const [loaded, setLoaded] = useState<ClassActivityItem | null>(null);

  useEffect(() => {
    if (!activityId) return;
    let active = true;
    void getActivityPreviewAction(activityId).then((res) => {
      if (active && res.ok && res.data) {
        setLoaded(res.data);
      }
    });
    return () => {
      active = false;
    };
  }, [activityId]);

  const activity = loaded ?? activities.find((a) => a.id === activityId) ?? activities[0];

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/activity-bank"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          &lt; Back to Activity Bank
        </Link>

        {!activity ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Activity not found or loading from database…
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100">
                Bank Activity Preview
              </p>
              <h1 className="mt-1 text-2xl font-bold">{activity.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-orange-100">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {activity.points} points
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {activity.topic}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {(activity.questions ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">
                  No questions attached to this activity yet.
                </p>
              ) : (
                (activity.questions ?? []).map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                      Question {idx + 1} · {q.points} pts
                    </p>
                    <RichHtmlContent html={q.prompt} className="mt-1.5 font-medium text-gray-900" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardTemplate>
  );
}
