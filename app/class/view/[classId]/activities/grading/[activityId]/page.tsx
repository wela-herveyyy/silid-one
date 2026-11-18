"use client";

import {
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Layers,
  MessageSquare,
  RotateCcw,
  Save,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { QuizAnalyticsPanel } from "@/components/organisms/QuizAnalyticsPanel";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ActivityGradingPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities, submissions } = useLmsSession();

  const activity = activities.find((a) => a.id === activityId) ?? activities[0];
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    submissions[0]?.studentId ?? "",
  );
  const [showStats, setShowStats] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState<"answers" | "evidence">("answers");
  const [feedback, setFeedback] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const pendingList = useMemo(
    () =>
      submissions.filter(
        (s) =>
          s.status !== "Graded" &&
          s.studentName.toLowerCase().includes(search.toLowerCase()),
      ),
    [submissions, search],
  );
  const gradedList = useMemo(
    () =>
      submissions.filter(
        (s) =>
          s.status === "Graded" &&
          s.studentName.toLowerCase().includes(search.toLowerCase()),
      ),
    [submissions, search],
  );

  const selectedStudent =
    submissions.find((s) => s.studentId === selectedStudentId) ?? submissions[0];

  return (
    <DashboardTemplate>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Orange-Header Student Queue Panel (matches vue_class_grading.png) */}
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-4 xl:col-span-3">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
            <Link
              href={`/class/view/${classId}/activities`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-100 hover:text-white"
            >
              &lt; Back to Activities
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Users className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-xs font-medium text-orange-100">
                  {submissions.length} Students
                </p>
                <h2 className="text-base font-bold text-white">Activity Grading</h2>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span>Pending Grading</span>
                <span className="text-gray-400">({pendingList.length})</span>
              </div>
              {pendingList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-5 text-center text-xs text-gray-400">
                  No pending submissions
                </div>
              ) : (
                <div className="space-y-1.5">
                  {pendingList.map((s) => (
                    <button
                      key={s.studentId}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(s.studentId);
                        setScoreSaved(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        selectedStudent?.studentId === s.studentId
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={s.studentName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900">
                            {s.studentName}
                          </p>
                          <p className="text-[11px] text-gray-400">{s.status}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-orange-600">
                        {s.score}/{s.maxScore}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>Completed</span>
                <span className="text-gray-400">({gradedList.length} graded)</span>
              </div>
              {gradedList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-5 text-center text-xs text-gray-400">
                  <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                  No completed grades
                </div>
              ) : (
                <div className="space-y-1.5">
                  {gradedList.map((s) => (
                    <button
                      key={s.studentId}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(s.studentId);
                        setScoreSaved(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        selectedStudent?.studentId === s.studentId
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={s.studentName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900">
                            {s.studentName}
                          </p>
                          <p className="text-[11px] text-gray-400">{s.submittedAt}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-green-700">
                        {s.score}/{s.maxScore}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Right Grading Pane (matches vue_class_grading.png) */}
        <div className="space-y-5 lg:col-span-8 xl:col-span-9">
          <div className="flex items-center justify-between">
            <Link
              href={`/class/view/${classId}/activities`}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              &lt; Back to Activities
            </Link>
          </div>

          {/* Orange Banner Header */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{activity.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-orange-100">
                  <Calendar className="h-3.5 w-3.5" />
                  Due: {activity.noDeadline ? "No deadline" : activity.deadline?.replace("T", " ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/class/view/${classId}/activities/score-report/${activity.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>View Score Report</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowStats((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-orange-100 hover:text-white"
                >
                  {showStats ? "Hide stats" : "Show stats"}
                </button>
              </div>
            </div>

            {showStats ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/15 p-3.5 backdrop-blur-sm">
                  <p className="text-xs text-orange-100">Questions</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {activity.questions?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white/15 p-3.5 backdrop-blur-sm">
                  <p className="text-xs text-orange-100">Sections</p>
                  <p className="mt-1 text-xl font-bold text-white">1</p>
                </div>
                <div className="rounded-xl bg-white/15 p-3.5 backdrop-blur-sm">
                  <p className="text-xs text-orange-100">Total Points</p>
                  <p className="mt-1 text-xl font-bold text-white">{activity.points}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Collapsible Quiz analytics matching live_25_real_grading.png */}
          {activity.type === "quiz" && activity.questions ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Quiz analytics</h2>
                  <p className="text-xs text-gray-500">
                    Question results, student insights, and score distribution
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnalytics((p) => !p)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  {showAnalytics ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showAnalytics ? "Hide analytics" : "Show analytics"}</span>
                </button>
              </div>
              {showAnalytics ? (
                <div className="mt-4">
                  <QuizAnalyticsPanel
                    questions={activity.questions}
                    submissions={submissions}
                    totalStudents={activity.totalStudents}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Selected Student Card + Tabs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedStudent?.studentName || "Select a student"} size="md" />
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedStudent?.studentName ?? "Select a student"}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted: {selectedStudent?.submittedAt ?? "No submission date"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      Retakes: 0
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 px-5 py-2.5 text-center">
                <p className="text-lg font-extrabold text-orange-600 tabular-nums">
                  {selectedStudent?.score ?? 0}/{selectedStudent?.maxScore ?? activity.points}
                </p>
                <p className="text-[11px] font-medium text-gray-500">Total Points</p>
              </div>
            </div>

            <div className="mt-5 flex border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab("answers")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 border-b-2 pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "answers"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Answers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 border-b-2 pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "evidence"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Evidence
              </button>
            </div>
          </div>

          {/* Instruction Box matching live_25_real_grading.png */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <p className="text-xs font-bold text-gray-800">. Instruction Box</p>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700">{activity.description}</div>
          </div>

          {activeTab === "answers" ? (
            activity.questions && activity.questions.length > 0 ? (
              <div className="space-y-4">
                {activity.questions.map((q, idx) => {
                  const typeLabelMap: Record<string, string> = {
                    "multiple-choice": "MULTIPLE CHOICE",
                    "true-false": "TRUE OR FALSE",
                    identification: "IDENTIFICATION",
                    essay: "ESSAY",
                    enumeration: "ENUMERATION",
                    matching: "MATCHING TYPE",
                    attachments: "ATTACH FILE",
                  };
                  const typeLabel = typeLabelMap[q.type] ?? q.type.toUpperCase();
                  const choices =
                    q.choices && q.choices.length > 0
                      ? q.choices
                      : q.type === "true-false"
                        ? ["True", "False"]
                        : [];
                  const studentAns = selectedStudent ? q.correctAnswer : "";

                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <span className="inline-flex rounded-full bg-gray-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {typeLabel}
                      </span>

                      <div className="mt-3 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                          <HelpCircle className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Question {idx + 1}</p>
                          <p className="text-[11px] text-gray-400">
                            {q.points} {q.points === 1 ? "point" : "points"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Question
                        </p>
                        <RichHtmlContent html={q.prompt} className="mt-1" />
                      </div>

                      {q.type === "essay" ||
                      q.type === "identification" ||
                      q.type === "enumeration" ||
                      q.type === "attachments" ? (
                        <div className="mt-4 space-y-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
                              A
                            </span>
                            Student&apos;s Answer
                          </p>
                          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-700">
                            {studentAns ? (
                              <RichHtmlContent html={studentAns} />
                            ) : (
                              "No answer provided by student"
                            )}
                          </div>
                        </div>
                      ) : q.type === "matching" ? (
                        <div className="mt-4 space-y-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
                              M
                            </span>
                            Matched Pairs
                          </p>
                          {(q.matchingPairs ?? []).map((pair) => (
                            <div
                              key={pair.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3.5 py-2 text-xs font-semibold text-gray-800"
                            >
                              <RichHtmlContent html={pair.left} />
                              <RichHtmlContent html={pair.right} className="text-emerald-700" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">
                                S
                              </span>
                              Student Answer
                            </p>
                            <div className="mt-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                              {studentAns ? (
                                <RichHtmlContent html={studentAns} />
                              ) : (
                                "No answer provided"
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
                                A
                              </span>
                              Answer Choices
                            </p>
                            <div className="mt-2 space-y-2">
                              {choices.map((choice, cIdx) => {
                                const letter = String.fromCharCode(65 + cIdx);
                                const isSelected = studentAns === choice;
                                return (
                                  <div
                                    key={`${q.id}-c-${cIdx}`}
                                    className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
                                      isSelected
                                        ? "border-emerald-300 bg-emerald-50/50 text-gray-900"
                                        : "border-gray-100 bg-gray-50/60 text-gray-700"
                                    }`}
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500">
                                      {letter}
                                    </span>
                                    <span
                                      className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border ${
                                        isSelected
                                          ? "border-emerald-600 bg-emerald-600"
                                          : "border-gray-300 bg-white"
                                      }`}
                                    />
                                    <RichHtmlContent html={choice} className="min-w-0 flex-1 font-medium" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-bold text-gray-700">No Questions Available</p>
                <p className="mt-1 text-xs text-gray-400">
                  Review submission response and record points below.
                </p>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No uploaded files</p>
              <p className="mt-1 text-xs text-gray-400">
                Review submission response and record points below.
              </p>
            </div>
          )}

          {/* Final Scoring + Actions (matches vue_class_grading.png) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Final Scoring</h3>
            <p className="mt-2 font-mono text-sm font-bold text-gray-900 tabular-nums">
              {selectedStudent?.score ?? 0} / {selectedStudent?.maxScore ?? activity.points}{" "}
              <span className="ml-2 font-sans text-xs font-normal text-gray-400">
                Auto-calculated: {selectedStudent?.score ?? 0} points
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Allow Retake
              </button>
              <button
                type="button"
                onClick={() => setScoreSaved(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <Save className="h-3.5 w-3.5" />
                Save Grade
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-400 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-500"
              >
                <Award className="h-3.5 w-3.5" />
                Send Badge
              </button>
              {scoreSaved ? (
                <span className="text-xs font-semibold text-green-600">Grade saved</span>
              ) : null}
            </div>
          </div>

          {/* Teacher Feedback Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              Teacher Feedback
            </h3>
            <RichTextEditor
              variant="comment"
              value={feedback}
              onChange={setFeedback}
              placeholder={
                selectedStudent
                  ? `Leave feedback for ${selectedStudent.studentName}...`
                  : "Please select a student to provide feedback"
              }
              ariaLabel="Teacher feedback HTML editor"
            />
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}
