"use client";

import { Download, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { QuizAnalyticsPanel } from "@/components/organisms/QuizAnalyticsPanel";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ActivityScoreReportPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities, submissions } = useLmsSession();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "name">("highest");

  const activity = activities.find((a) => a.id === activityId) ?? activities[0];
  const submitted = submissions.filter((s) => s.status !== "Missing");
  const graded = submissions.filter((s) => s.status === "Graded");
  const pcts = submitted.map((s) => Math.round((s.score / Math.max(1, s.maxScore)) * 100));
  const avgPct = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
  const highestPct = pcts.length > 0 ? Math.max(...pcts) : 0;
  const lowestPct = pcts.length > 0 ? Math.min(...pcts) : 0;
  const submissionRate = Math.round((submitted.length / Math.max(1, submissions.length)) * 100);

  const buckets = [
    { label: "90–100%", color: "bg-green-500", min: 90, max: 101 },
    { label: "80–89%", color: "bg-lime-500", min: 80, max: 90 },
    { label: "60–79%", color: "bg-amber-400", min: 60, max: 80 },
    { label: "0–59%", color: "bg-orange-500", min: 0, max: 60 },
  ].map((b) => ({
    ...b,
    count: pcts.filter((p) => p >= b.min && p < b.max).length,
  }));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = submissions.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) || s.sectionName.toLowerCase().includes(q),
    );
    if (sortBy === "highest") return [...list].sort((a, b) => b.score - a.score);
    if (sortBy === "lowest") return [...list].sort((a, b) => a.score - b.score);
    return [...list].sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [submissions, search, sortBy]);

  if (!activity) {
    return (
      <ClassWorkspaceTemplate classId={classId}>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading score report…
        </div>
      </ClassWorkspaceTemplate>
    );
  }

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/class/view/${classId}/activities`}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            &lt; Back to Activities
          </Link>
        </div>

        {/* Dark Orange Gradient Header Banner matching vue_class_score_report.png */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100">
                Score Report
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">{activity.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1 capitalize">
                  {activity.type}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {submissions.length} students
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {submitted.length} submitted
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {graded.length} graded
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1">
                  {activity.points} total points
                </span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Class Average
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{avgPct}%</p>
            <p className="mt-1 text-xs text-gray-500">Across scored work</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Submission Rate
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{submissionRate}%</p>
            <p className="mt-1 text-xs text-gray-500">Students who submitted</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Highest Score
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{highestPct}%</p>
            <p className="mt-1 text-xs text-gray-500">Top percentage</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Lowest Score
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{lowestPct}%</p>
            <p className="mt-1 text-xs text-gray-500">Among scored students</p>
          </div>
        </div>

        {/* Submission Status + Score Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Submission Status
            </h3>
            <div className="mt-6 flex flex-wrap items-center gap-8">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[10px] border-orange-500 bg-orange-50/40 text-center">
                <span className="text-xl font-extrabold text-gray-900">{submissionRate}%</span>
                <span className="text-[11px] text-gray-500">submitted</span>
              </div>
              <ul className="flex-1 space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> Not submitted
                  </span>
                  <span className="font-mono font-semibold text-gray-900">
                    {submissions.length - submitted.length}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Submitted (ungraded)
                  </span>
                  <span className="font-mono font-semibold text-gray-900">
                    {submitted.length - graded.length}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Graded
                  </span>
                  <span className="font-mono font-semibold text-gray-900">{graded.length}</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Score Distribution
            </h3>
            <p className="mt-1 text-xs text-gray-400">How students performed (by percentage)</p>
            <div className="mt-5 space-y-3">
              {buckets.map((b) => {
                const w = submitted.length > 0 ? Math.round((b.count / submitted.length) * 100) : 0;
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{b.label}</span>
                      <span>{b.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${w}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {activity.type === "quiz" && activity.questions ? (
          <QuizAnalyticsPanel
            questions={activity.questions}
            submissions={submissions}
            totalStudents={activity.totalStudents}
          />
        ) : null}

        {/* Student Scores Table */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or section..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <select
              aria-label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "highest" | "lowest" | "name")}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="highest">Highest score</option>
              <option value="lowest">Lowest score</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                All Student Scores
              </h3>
              <p className="text-xs text-gray-400">
                {rows.length} of {submissions.length} students shown
              </p>
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3 text-right">Score</th>
                  <th className="px-5 py-3 text-right">%</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-orange-50/20">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{row.studentName}</td>
                    <td className="px-5 py-3.5 text-gray-500">{row.sectionName}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-gray-900">
                      {row.score}/{row.maxScore}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-orange-600 tabular-nums">
                      {Math.round((row.score / Math.max(1, row.maxScore)) * 100)}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.status === "Graded"
                            ? "bg-green-50 text-green-700"
                            : row.status === "Missing"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                      {row.submittedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
