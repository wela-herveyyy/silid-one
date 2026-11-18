"use client";

import { BarChart2, Calendar, Clipboard, Download, Eye, Filter, Hash, Layers } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ClassGradebookPage() {
  const { classId } = useParams<{ classId: string }>();
  const { submissions, members, activities, components } = useLmsSession();
  const [tab, setTab] = useState<"activity" | "evaluation">("activity");
  const [quarter, setQuarter] = useState("1st Term");
  const [baseGrade, setBaseGrade] = useState("Base 50");
  const [viewType, setViewType] = useState("Simple");

  const students = members.filter((m) => m.role === "Student");
  const activeActivities = activities.filter((a) => !a.deleted);
  const totalWeight = components.reduce((sum, c) => sum + c.weightPercent, 0);
  const weightStatus =
    totalWeight === 100
      ? { label: "BALANCED", classes: "border-emerald-200 bg-emerald-50 text-emerald-700" }
      : totalWeight < 100
        ? { label: "UNDER-WEIGHTED", classes: "border-amber-200 bg-amber-50 text-amber-700" }
        : { label: "OVER-WEIGHTED", classes: "border-rose-200 bg-rose-50 text-rose-700" };
  const needsImprovement = submissions.filter((s) => (s.score / Math.max(1, s.maxScore)) * 100 < 75).length;

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        {/* Header matching vue_class_gradebook.png */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
            Class Performance
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Grade Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage student grades across components and terms.
          </p>
        </div>

        {/* 4 Stat Cards with pastel pill badges matching vue_class_gradebook.png */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
              {students.length}
            </span>
            <p className="mt-2 text-sm font-medium text-gray-600">Enrolled</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">
              {students.length > 0 ? `${Math.round((needsImprovement / students.length) * 100)}%` : "0%"}
            </span>
            <p className="mt-2 text-sm font-medium text-gray-600">Needs Improvement</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600">
              {activeActivities.length}
            </span>
            <p className="mt-2 text-sm font-medium text-gray-600">Activities</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-600">
              88.4%
            </span>
            <p className="mt-2 text-sm font-medium text-gray-600">Total</p>
          </div>
        </div>

        {/* Underline Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab("activity")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === "activity"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Clipboard className="h-4 w-4" />
              <span>Activity Grades</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("evaluation")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === "evaluation"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Evaluation Results</span>
            </button>
          </div>
        </div>

        {/* Breakdown / Grading components matching live_12_class_gradebook.png */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 px-6 pt-5 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Breakdown
              </p>
              <h3 className="text-sm font-bold text-gray-900">Grading components</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-6 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((comp, idx) => {
              const compPoints = activeActivities
                .filter(
                  (a) => a.categoryName.toLowerCase() === comp.categoryName.toLowerCase(),
                )
                .reduce((sum, a) => sum + a.points, 0);

              return (
                <div
                  key={comp.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-xs font-bold text-orange-600">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{comp.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-orange-600 tabular-nums">
                        {comp.weightPercent}%
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        Weight
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Total points</span>
                    <span className="font-bold text-gray-900 tabular-nums">{compPoints}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.min(100, comp.weightPercent)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] text-gray-400">
                    {comp.weightPercent}% of final grade
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-6 py-3 text-xs">
            <span className="font-semibold text-gray-600">Total grading weight</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 tabular-nums">{totalWeight}%</span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${weightStatus.classes}`}
              >
                {weightStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Filters + Orange Export CTA */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-bold uppercase tracking-wider text-gray-600">Filters</span>
            <span className="text-orange-500">· {baseGrade}: Minimum grade is 50%. Range 50–100%.</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                </select>
              </label>

              <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={baseGrade}
                  onChange={(e) => setBaseGrade(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="Base 50">Base 50</option>
                  <option value="Base 0">Base 0</option>
                </select>
              </label>

              <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
                <Eye className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="Simple">Simple</option>
                  <option value="Detailed">Detailed</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              <Download className="h-4 w-4" />
              <span>Export All Grades</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5 text-right">Quiz 1 (10)</th>
                <th className="px-5 py-3.5 text-right">Essay (100)</th>
                <th className="px-5 py-3.5 text-right">{quarter} Average</th>
                <th className="px-5 py-3.5 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((row, idx) => {
                const essay = [94, 86, 91, 68][idx % 4];
                const rawAvg = Math.round(((row.score / Math.max(1, row.maxScore)) * 100 + essay) / 2);
                const transmuted = baseGrade === "Base 50" ? Math.max(50, rawAvg) : rawAvg;
                return (
                  <tr key={row.studentId} className="hover:bg-orange-50/30">
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{row.studentName}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-gray-700">
                      {row.score}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-gray-700">
                      {essay}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums text-gray-900">
                      {transmuted}%
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          transmuted >= 75
                            ? "bg-green-50 text-green-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {transmuted >= 75 ? "Passing" : "Needs follow-up"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
