"use client";

import { CheckCircle2, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import { stripHtmlToText } from "@/lib/richEditorContent";

export default function AnswerQuizPage() {
  const { classId, activityId } = useParams<{ classId: string; activityId: string }>();
  const { activities } = useLmsSession();
  const activity =
    activities.find((a) => a.id === activityId) ??
    activities.find((a) => a.type === "quiz") ??
    activities[0];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!activity) {
    return (
      <ClassWorkspaceTemplate classId={classId}>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading quiz…
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

        {/* Orange Gradient Quiz Header matching AnswerQuizView.vue 1:1 */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white sm:px-8">
            <h1 className="text-2xl font-bold lg:text-3xl">{activity.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-orange-100">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due: {activity.noDeadline ? "No deadline" : activity.deadline?.replace("T", " ")}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {activity.points} points
              </span>
              {activity.topic ? (
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {activity.topic}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {submitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50/70 p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                <h3 className="mt-3 text-lg font-bold text-gray-900">Quiz Submitted</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Your responses have been recorded for teacher review.
                </p>
                <Link
                  href={`/class/view/${classId}/activities/graded/${activity.id}`}
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                  View Score Summary
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {(activity.questions ?? []).map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                        Question {idx + 1}
                      </span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-orange-600 tabular-nums">
                        {q.points} pts
                      </span>
                    </div>
                    <RichHtmlContent html={q.prompt} className="mt-2 text-base font-semibold text-gray-900" />

                    {q.type === "multiple-choice" || q.type === "true-false" ? (
                      <div className="mt-4 space-y-2.5">
                        {(q.choices ?? ["True", "False"]).map((choice, cIdx) => {
                          const checked = answers[q.id] === choice;
                          return (
                            <label
                              key={`${q.id}-c-${cIdx}`}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                                checked
                                  ? "border-orange-500 bg-orange-50/60 text-orange-900"
                                  : "border-gray-200 bg-gray-50/50 text-gray-800 hover:border-orange-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={choice}
                                checked={checked}
                                onChange={(e) =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                              />
                              <RichHtmlContent html={choice} className="min-w-0 flex-1" />
                            </label>
                          );
                        })}
                      </div>
                    ) : q.type === "essay" ? (
                      <div className="mt-4">
                        <RichTextEditor
                          variant="comment"
                          value={answers[q.id] ?? ""}
                          onChange={(html) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: html }))
                          }
                          placeholder="Write your detailed essay response..."
                          ariaLabel={`Essay response for question ${idx + 1}`}
                        />
                      </div>
                    ) : q.type === "enumeration" ? (
                      <div className="mt-4 space-y-2">
                        {Array.from({
                          length: Math.max(2, q.correctAnswers?.length ?? 3),
                        }).map((_, eIdx) => {
                          const key = `${q.id}-enum-${eIdx}`;
                          return (
                            <input
                              key={key}
                              type="text"
                              value={answers[key] ?? ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              placeholder={`Item #${eIdx + 1}`}
                              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                            />
                          );
                        })}
                      </div>
                    ) : q.type === "matching" ? (
                      <div className="mt-4 space-y-2.5">
                        {(q.matchingPairs ?? []).map((pair) => {
                          const rightOptions = (q.matchingPairs ?? []).map((p) => p.right);
                          const key = `${q.id}-pair-${pair.id}`;
                          return (
                            <div
                              key={pair.id}
                              className="grid grid-cols-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:grid-cols-2"
                            >
                              <RichHtmlContent
                                html={pair.left}
                                className="text-sm font-semibold text-gray-800"
                              />
                              <select
                                value={answers[key] ?? ""}
                                onChange={(e) =>
                                  setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-orange-500 focus:outline-none"
                              >
                                <option value="">Select match...</option>
                                {rightOptions.map((opt, oIdx) => (
                                  <option key={`${pair.id}-opt-${oIdx}`} value={opt}>
                                    {stripHtmlToText(opt) || `Option ${oIdx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    ) : q.type === "attachments" ? (
                      <div className="mt-4 space-y-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                        <input
                          type="file"
                          onChange={(e) => {
                            const fileName = e.target.files?.[0]?.name ?? "";
                            if (fileName) {
                              setAnswers((prev) => ({ ...prev, [q.id]: fileName }));
                            }
                          }}
                          className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-orange-600"
                        />
                        {answers[q.id] ? (
                          <p className="text-xs font-medium text-emerald-700">
                            Attached: {answers[q.id]}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Type your answer..."
                        className="mt-4 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-full bg-orange-500 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                  >
                    Submit Quiz
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
