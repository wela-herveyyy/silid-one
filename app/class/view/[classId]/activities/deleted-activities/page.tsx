"use client";

import { ArrowUpDown, FileText, Filter, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function DeletedActivitiesPage() {
  const { classId } = useParams<{ classId: string }>();
  const { activities, toggleDeleteActivity } = useLmsSession();
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const trashed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = activities.filter(
      (a) =>
        a.deleted &&
        (!q || a.title.toLowerCase().includes(q) || a.topic.toLowerCase().includes(q)),
    );
    return sortAsc ? list : [...list].reverse();
  }, [activities, search, sortAsc]);

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/class/view/${classId}/activities`}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            &lt; Back to Activities
          </Link>
        </div>

        {/* Centered Header + Pill Controls matching vue_class_deleted_act.png */}
        <div className="mx-auto max-w-2xl space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Deleted Activities</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage deleted activities</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 shadow-sm">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </span>

            <button
              type="button"
              onClick={() => setSortAsc((p) => !p)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:text-orange-600"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>

        {trashed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-gray-800">No activities yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Deleted activities can be restored here at any time.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {trashed.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    {item.type}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDeleteActivity(item.id)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClassWorkspaceTemplate>
  );
}
