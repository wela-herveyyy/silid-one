"use client";

import { Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function MaterialViewPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities } = useLmsSession();
  const material =
    activities.find((a) => a.id === activityId) ??
    activities.find((a) => a.type === "material") ??
    activities[0];

  if (!material) {
    return (
      <ClassWorkspaceTemplate classId={classId}>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading material…
        </div>
      </ClassWorkspaceTemplate>
    );
  }

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        <Link
          href={`/class/view/${classId}/activities`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          &lt; Go Back
        </Link>

        {/* Material Card matching vue_class_material_view.png 1:1 */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">{material.title}</h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-pink-600">
                <FileText className="h-3 w-3" />
                Material
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              Published {material.publishedDate.replace("T", " ")}
            </p>
          </div>

          <div className="p-6 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Instructions
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              {material.description ? (
                <RichHtmlContent html={material.description} />
              ) : (
                <p className="text-sm text-gray-500">No instructions provided.</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </ClassWorkspaceTemplate>
  );
}
