"use client";

import { RefreshCw } from "lucide-react";
import { ClassListsSection } from "@/components/organisms/ClassListsSection";
import { ClassesContentSkeleton } from "@/components/organisms/PageSkeletons";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export function ClassesPageView({ archivesMode = false }: { archivesMode?: boolean }) {
  const { user, classes, externalCourses, role, designTheme, toggleArchiveClass, frappeMeta } =
    useLmsSession();

  return (
    <DashboardTemplate>
      {frappeMeta.connected ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-2.5 text-xs text-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-semibold text-gray-900">
              {frappeMeta.schoolName || frappeMeta.schoolSite}
            </span>
            {frappeMeta.schoolCode ? (
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200">
                {frappeMeta.schoolCode}
              </span>
            ) : null}
            <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-700">
              {frappeMeta.schoolVersion}
            </span>
            <span className="text-gray-600">
              {frappeMeta.loading
                ? "Syncing live classes via Frappe DocType (sid header)…"
                : frappeMeta.error
                  ? frappeMeta.error
                  : `${classes.length} live ${classes.length === 1 ? "class" : "classes"} loaded`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void frappeMeta.refresh()}
            disabled={frappeMeta.loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${frappeMeta.loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      ) : null}

      {frappeMeta.loading && classes.length === 0 ? (
        <ClassesContentSkeleton />
      ) : (
        <ClassListsSection
          userName={user.name}
          classes={classes}
          externalCourses={externalCourses}
          role={role}
          designTheme={designTheme}
          archivesMode={archivesMode}
          onToggleArchive={toggleArchiveClass}
        />
      )}
    </DashboardTemplate>
  );
}
