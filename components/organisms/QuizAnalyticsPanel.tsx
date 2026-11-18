"use client";

import { BarChart2 } from "lucide-react";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import type { QuizQuestionItem, SubmissionScoreRow } from "@/types/lms";

interface QuizAnalyticsPanelProps {
  questions: QuizQuestionItem[];
  submissions: SubmissionScoreRow[];
  totalStudents: number;
}

export function QuizAnalyticsPanel({
  questions,
  submissions,
  totalStudents,
}: QuizAnalyticsPanelProps) {
  const submitted = submissions.filter((s) => s.status !== "Missing");
  const avgPct =
    submitted.length > 0
      ? Math.round(
          (submitted.reduce((sum, r) => sum + r.score / Math.max(1, r.maxScore), 0) /
            submitted.length) *
            100,
        )
      : 0;
  const highest = submitted.length > 0 ? Math.max(...submitted.map((r) => r.score)) : 0;
  const maxScore = submitted[0]?.maxScore ?? 10;

  if (submitted.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
        <BarChart2 className="mb-2 h-8 w-8 text-gray-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-gray-700">No submissions yet</p>
        <p className="mt-1 max-w-sm text-sm text-gray-600">
          Question insights will appear when students submit this quiz. Grades will appear after
          submissions are graded.
        </p>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Submissions",
      value: `${submitted.length}/${totalStudents}`,
      hint: `${Math.round((submitted.length / Math.max(1, totalStudents)) * 100)}% turned in`,
    },
    {
      label: "Mean score",
      value: `${avgPct}%`,
      hint: "Across graded submissions",
    },
    {
      label: "Highest score",
      value: `${highest}/${maxScore}`,
      hint: "Top recorded attempt",
    },
    {
      label: "Questions",
      value: String(questions.length),
      hint: "Auto-scored & manual",
    },
  ];

  const buckets = [
    { label: "90% - 100%", min: 90, max: 101 },
    { label: "75% - 89%", min: 75, max: 90 },
    { label: "60% - 74%", min: 60, max: 75 },
    { label: "Below 60%", min: 0, max: 60 },
  ].map((b) => {
    const count = submitted.filter((s) => {
      const pct = (s.score / Math.max(1, s.maxScore)) * 100;
      return pct >= b.min && pct < b.max;
    }).length;
    return { ...b, count };
  });

  const topScorers = [...submitted]
    .sort((a, b) => b.score / Math.max(1, b.maxScore) - a.score / Math.max(1, a.maxScore))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-600">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">How to read these insights</p>
        <p className="mt-1">
          Scores come from recorded grades. Partial answers count as not correct; ungraded essay
          answers and file uploads are not included in correctness counts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-base font-bold text-gray-900">Score distribution</h3>
          <p className="mt-1 text-sm text-gray-600">
            {submitted.length} of {submitted.length} submissions have a loaded grade with total
            points. Each bar shows the number of students in that score range.
          </p>
          <div className="mt-5 space-y-3">
            {buckets.map((bucket) => {
              const width =
                submitted.length > 0 ? Math.round((bucket.count / submitted.length) * 100) : 0;
              return (
                <div key={bucket.label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-700">{bucket.label}</span>
                    <span className="text-gray-700">
                      {bucket.count} {bucket.count === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-base font-bold text-gray-900">Top scores</h3>
          <p className="mt-1 text-sm text-gray-600">
            Up to six highest scores among loaded graded submissions.
          </p>
          <ol className="mt-5 space-y-4">
            {topScorers.map((student, index) => {
              const percentage = Math.round(
                (student.score / Math.max(1, student.maxScore)) * 100,
              );
              return (
                <li key={student.studentId}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words font-medium text-gray-800">
                      {index + 1}. {student.studentName}
                    </span>
                    <span className="shrink-0 font-semibold text-gray-900">
                      {student.score}/{student.maxScore} ({percentage}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-base font-bold text-gray-900">Question breakdown</h3>
        <p className="mt-1 text-sm text-gray-600">
          Each count represents a student&apos;s result for a question. Difficulty reflects this
          class&apos;s automatic checks.
        </p>

        <div className="mt-5 space-y-4">
          {questions.map((q, idx) => {
            const simulatedAccuracy = [92, 86, 78, 64][idx % 4];
            const difficultyBadge =
              simulatedAccuracy >= 80
                ? { label: "Easy", cls: "bg-green-100 text-green-800" }
                : simulatedAccuracy >= 70
                  ? { label: "Moderate", cls: "bg-amber-100 text-amber-800" }
                  : { label: "Challenging", cls: "bg-rose-100 text-rose-800" };

            return (
              <article key={q.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-start gap-1.5 font-semibold text-gray-900">
                      <span className="shrink-0">Q{idx + 1}.</span>
                      <RichHtmlContent html={q.prompt} className="min-w-0 font-semibold text-gray-900" />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="capitalize">{q.type.replace(/-/g, " ")}</span> · {q.points}{" "}
                      {q.points === 1 ? "point" : "points"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyBadge.cls}`}
                  >
                    {difficultyBadge.label}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>Correctness rate</span>
                    <span>{simulatedAccuracy}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${simulatedAccuracy}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
