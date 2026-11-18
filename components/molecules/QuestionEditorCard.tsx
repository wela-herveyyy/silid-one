"use client";

import { ChevronDown, ChevronRight, Copy, Info, Paperclip, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { hasEditorContent, stripHtmlToText } from "@/lib/richEditorContent";
import type { QuestionType, QuizQuestionItem } from "@/types/lms";

function isSameChoiceValue(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  return (
    hasEditorContent(a) &&
    hasEditorContent(b) &&
    stripHtmlToText(a) === stripHtmlToText(b)
  );
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "true-false": "True or False",
  essay: "Essay",
  identification: "Identification",
  enumeration: "Enumeration",
  matching: "Matching Type",
  attachments: "Attach File",
};

interface QuestionEditorCardProps {
  question: QuizQuestionItem;
  index: number;
  onChange: (updated: QuizQuestionItem) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function QuestionEditorCard({
  question,
  index,
  onChange,
  onDuplicate,
  onRemove,
}: QuestionEditorCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [collapsedPairs, setCollapsedPairs] = useState<number[]>([]);

  const typeLabel = QUESTION_TYPE_LABELS[question.type] ?? question.type;
  const choices = question.choices ?? ["Option A", "Option B", "Option C", "Option D"];
  const answersList = question.correctAnswers ?? [question.correctAnswer || ""];
  const altAnswersList = question.alternativeAnswers ?? [];
  const pairs = question.matchingPairs ?? [{ id: `pair-${index}-1`, left: "", right: "" }];
  const refs = question.referenceAttachments ?? [];

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white pt-2 shadow-sm">
      <div className="absolute -top-2.5 left-6 border border-[#096dd9] bg-[#e6f7ff] px-3 py-0.5 text-[11px] font-semibold text-[#096dd9]">
        {typeLabel}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span>Question #{index + 1}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={question.type}
            onChange={(e) => {
              const nextType = e.target.value as QuestionType;
              onChange({
                ...question,
                type: nextType,
                choices:
                  nextType === "multiple-choice"
                    ? question.choices ?? ["Option A", "Option B", "Option C", "Option D"]
                    : nextType === "true-false"
                      ? ["True", "False"]
                      : undefined,
                correctAnswer:
                  nextType === "true-false"
                    ? "True"
                    : nextType === "multiple-choice"
                      ? "Option A"
                      : question.correctAnswer,
                correctAnswers:
                  nextType === "enumeration" || nextType === "identification"
                    ? question.correctAnswers ?? [""]
                    : undefined,
                matchingPairs:
                  nextType === "matching"
                    ? question.matchingPairs ?? [{ id: `mp-${Date.now()}`, left: "", right: "" }]
                    : undefined,
              });
            }}
            aria-label="Question type"
            className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-700 focus:border-orange-500 focus:outline-none"
          >
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove question"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-xs font-semibold text-gray-600">
              {question.type === "enumeration" ? "Points Per Item" : "Points"}
            </label>
            <input
              type="number"
              min={0}
              value={question.points}
              onChange={(e) =>
                onChange({ ...question, points: Math.max(0, Number(e.target.value) || 0) })
              }
              className="h-9 w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <RichTextEditor
            variant="full"
            minHeightClass="min-h-[10rem]"
            value={question.prompt}
            onChange={(html) => onChange({ ...question, prompt: html })}
            placeholder="Write the question or prompt here..."
            ariaLabel={`Question ${index + 1} HTML prompt editor`}
          />

          {/* 1. MULTIPLE CHOICE */}
          {question.type === "multiple-choice" ? (
            <div className="space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(question.shuffleChoices)}
                  onChange={(e) => onChange({ ...question, shuffleChoices: e.target.checked })}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                <span>Shuffle choices during test</span>
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {choices.map((choice, cIdx) => {
                  const isCorrect = isSameChoiceValue(question.correctAnswer, choice);
                  return (
                    <div
                      key={`${question.id}-c-${cIdx}`}
                      className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-3"
                    >
                      <RichTextEditor
                        variant="comment"
                        minHeightClass="min-h-[6rem]"
                        value={choice}
                        onChange={(html) => {
                          const updated = [...choices];
                          const oldVal = updated[cIdx];
                          updated[cIdx] = html;
                          onChange({
                            ...question,
                            choices: updated,
                            correctAnswer: isSameChoiceValue(question.correctAnswer, oldVal)
                              ? html
                              : question.correctAnswer,
                          });
                        }}
                        placeholder={`Enter choice ${cIdx + 1}, e.g., Manila`}
                        ariaLabel={`Question ${index + 1} choice ${cIdx + 1} HTML editor`}
                      />
                      <div className="flex items-center justify-between pt-0.5">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600">
                          <input
                            type="radio"
                            name={`mc-${question.id}`}
                            checked={isCorrect}
                            onChange={() => onChange({ ...question, correctAnswer: choice })}
                            className="accent-orange-500"
                          />
                          <span>correct</span>
                        </label>
                        {choices.length > 2 ? (
                          <button
                            type="button"
                            onClick={() =>
                              onChange({
                                ...question,
                                choices: choices.filter((_, i) => i !== cIdx),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete choice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...question,
                    choices: [...choices, `Option ${choices.length + 1}`],
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#f87b11] px-2.5 py-1 text-xs font-semibold text-[#f87b11] hover:bg-orange-50"
              >
                <span>Add Choice</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          {/* 2. TRUE OR FALSE */}
          {question.type === "true-false" ? (
            <div className="flex items-center gap-4">
              {["True", "False"].map((tf) => (
                <label
                  key={tf}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${
                    question.correctAnswer === tf
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    checked={question.correctAnswer === tf}
                    onChange={() => onChange({ ...question, correctAnswer: tf })}
                    className="accent-orange-500"
                  />
                  <span>{tf}</span>
                </label>
              ))}
            </div>
          ) : null}

          {/* 3. ESSAY */}
          {question.type === "essay" ? (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="font-medium">
                Essay responses require manual teacher grading. Enter scoring rubric or sample answer:
              </p>
              <RichTextEditor
                variant="comment"
                minHeightClass="min-h-[5rem]"
                value={question.correctAnswer}
                onChange={(html) => onChange({ ...question, correctAnswer: html })}
                placeholder="Optional grading rubric / expected key points..."
                ariaLabel={`Question ${index + 1} essay rubric HTML editor`}
              />
            </div>
          ) : null}

          {/* 4. IDENTIFICATION */}
          {question.type === "identification" ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 text-xs text-gray-700">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(question.ignorePunctuation)}
                    onChange={(e) => onChange({ ...question, ignorePunctuation: e.target.checked })}
                    className="h-4 w-4 rounded accent-orange-500"
                  />
                  <span>System will NOT check for punctuations and special characters</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(question.ignoreCase)}
                    onChange={(e) => onChange({ ...question, ignoreCase: e.target.checked })}
                    className="h-4 w-4 rounded accent-orange-500"
                  />
                  <span>System will NOT check for case sensitive answers</span>
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">Possible Answers:</p>
                {answersList.map((ans, aIdx) => (
                  <div key={`${question.id}-id-${aIdx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const updated = [...answersList];
                        updated[aIdx] = e.target.value;
                        onChange({
                          ...question,
                          correctAnswer: updated[0] ?? "",
                          correctAnswers: updated,
                        });
                      }}
                      placeholder="Enter an accepted answer, e.g., Philippines"
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                    {answersList.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = answersList.filter((_, i) => i !== aIdx);
                          onChange({
                            ...question,
                            correctAnswer: updated[0] ?? "",
                            correctAnswers: updated,
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...question,
                      correctAnswers: [...answersList, ""],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#f87b11] px-2.5 py-1 text-xs font-semibold text-[#f87b11] hover:bg-orange-50"
                >
                  <span>Add Answer</span>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}

          {/* 5. ENUMERATION */}
          {question.type === "enumeration" ? (
            <div className="space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(question.ignorePunctuation)}
                  onChange={(e) => onChange({ ...question, ignorePunctuation: e.target.checked })}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                <span>System will NOT check for punctuations and special characters</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </label>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">Answers:</p>
                {answersList.map((ans, aIdx) => (
                  <div key={`${question.id}-en-${aIdx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const updated = [...answersList];
                        updated[aIdx] = e.target.value;
                        onChange({
                          ...question,
                          correctAnswers: updated,
                          correctAnswer: updated.filter(Boolean).join(", "),
                        });
                      }}
                      placeholder="Enter an answer item, e.g., Luzon"
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                    {answersList.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = answersList.filter((_, i) => i !== aIdx);
                          onChange({
                            ...question,
                            correctAnswers: updated,
                            correctAnswer: updated.filter(Boolean).join(", "),
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...question,
                      correctAnswers: [...answersList, ""],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#f87b11] px-2.5 py-1 text-xs font-semibold text-[#f87b11] hover:bg-orange-50"
                >
                  <span>Add Answer</span>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-600">
                  Alternative Answers (Optional)
                </p>
                {altAnswersList.map((ans, aIdx) => (
                  <div key={`${question.id}-alt-${aIdx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const updated = [...altAnswersList];
                        updated[aIdx] = e.target.value;
                        onChange({ ...question, alternativeAnswers: updated });
                      }}
                      placeholder="Enter an alternative answer, e.g., NCR"
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...question,
                          alternativeAnswers: altAnswersList.filter((_, i) => i !== aIdx),
                        })
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...question,
                      alternativeAnswers: [...altAnswersList, ""],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#f87b11] px-2.5 py-1 text-xs font-semibold text-[#f87b11] hover:bg-orange-50"
                >
                  <span>Add Alternative</span>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}

          {/* 6. MATCHING TYPE */}
          {question.type === "matching" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">Build the pairs</p>
                  <p className="text-[11px] text-gray-500">
                    Enter a prompt and its matching answer on the same row.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCollapsedPairs([])}
                    className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    Expand all
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollapsedPairs(pairs.map((_, i) => i))}
                    className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    Collapse all
                  </button>
                </div>
              </div>

              {pairs.map((pair, pIdx) => {
                const isCollapsed = collapsedPairs.includes(pIdx);
                return (
                  <div
                    key={pair.id}
                    className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedPairs((prev) =>
                            prev.includes(pIdx) ? prev.filter((x) => x !== pIdx) : [...prev, pIdx],
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                        <span>Pair {pIdx + 1}</span>
                      </button>
                      {pairs.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              ...question,
                              matchingPairs: pairs.filter((_, i) => i !== pIdx),
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove pair</span>
                        </button>
                      ) : null}
                    </div>
                    {!isCollapsed ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <span className="text-xs font-medium text-gray-700">Prompt (required)</span>
                          <RichTextEditor
                            variant="comment"
                            minHeightClass="min-h-[5rem]"
                            value={pair.left}
                            onChange={(html) => {
                              const nextPairs = [...pairs];
                              nextPairs[pIdx] = { ...pair, left: html };
                              onChange({
                                ...question,
                                matchingPairs: nextPairs,
                                correctAnswer: nextPairs
                                  .map((p) => `${stripHtmlToText(p.left)} -> ${stripHtmlToText(p.right)}`)
                                  .join(", "),
                              });
                            }}
                            placeholder="Enter an item to match, e.g., Penguin"
                            ariaLabel={`Pair ${pIdx + 1} prompt HTML editor`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-xs font-medium text-gray-700">
                            Matching answer (required)
                          </span>
                          <RichTextEditor
                            variant="comment"
                            minHeightClass="min-h-[5rem]"
                            value={pair.right}
                            onChange={(html) => {
                              const nextPairs = [...pairs];
                              nextPairs[pIdx] = { ...pair, right: html };
                              onChange({
                                ...question,
                                matchingPairs: nextPairs,
                                correctAnswer: nextPairs
                                  .map((p) => `${stripHtmlToText(p.left)} -> ${stripHtmlToText(p.right)}`)
                                  .join(", "),
                              });
                            }}
                            placeholder="Enter its match, e.g., Antarctic coast"
                            ariaLabel={`Pair ${pIdx + 1} answer HTML editor`}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...question,
                    matchingPairs: [...pairs, { id: `mp-${Date.now()}`, left: "", right: "" }],
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#f87b11] px-2.5 py-1 text-xs font-semibold text-[#f87b11] hover:bg-orange-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add pair</span>
              </button>
            </div>
          ) : null}

          {/* 7. ATTACH FILE */}
          {question.type === "attachments" ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <span>Reference Attachments (Optional)</span>
              </div>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).map((f) => f.name);
                  if (files.length > 0) {
                    const nextRefs = [...refs, ...files];
                    onChange({
                      ...question,
                      referenceAttachments: nextRefs,
                      correctAnswer: nextRefs.join(", "),
                    });
                  }
                }}
                className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-orange-600 hover:file:bg-orange-100"
              />
              {refs.length > 0 ? (
                <ul className="space-y-1 text-xs text-gray-700">
                  {refs.map((name, fIdx) => (
                    <li
                      key={`${name}-${fIdx}`}
                      className="flex items-center justify-between rounded bg-white px-2.5 py-1.5"
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...question,
                            referenceAttachments: refs.filter((_, i) => i !== fIdx),
                          })
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
