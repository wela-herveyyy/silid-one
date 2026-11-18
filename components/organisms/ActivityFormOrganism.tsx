"use client";

import { ChevronDown, ChevronRight, Copy, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { QUESTION_TYPE_LABELS, QuestionEditorCard } from "@/components/molecules/QuestionEditorCard";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type {
  ActivityClassification,
  ClassActivityItem,
  QuestionType,
  QuizQuestionItem,
  StudentVisibilityMode,
} from "@/types/lms";

interface ActivityFormOrganismProps {
  classId: string;
  activityType: ActivityClassification;
  existing?: ClassActivityItem;
}

const QUESTION_TYPE_LIST: QuestionType[] = [
  "multiple-choice",
  "true-false",
  "essay",
  "identification",
  "enumeration",
  "matching",
  "attachments",
];

function createBlankQuestion(type: QuestionType, idx: number): QuizQuestionItem {
  return {
    id: `q-new-${Date.now()}-${idx}`,
    type,
    prompt: "",
    points: type === "essay" || type === "attachments" ? 5 : 1,
    choices:
      type === "multiple-choice"
        ? ["Option A", "Option B", "Option C", "Option D"]
        : type === "true-false"
          ? ["True", "False"]
          : undefined,
    correctAnswer:
      type === "multiple-choice"
        ? "Option A"
        : type === "true-false"
          ? "True"
          : "",
    correctAnswers:
      type === "identification" || type === "enumeration" ? [""] : undefined,
    matchingPairs:
      type === "matching" ? [{ id: `mp-${Date.now()}`, left: "", right: "" }] : undefined,
    referenceAttachments: type === "attachments" ? [] : undefined,
  };
}

export function ActivityFormOrganism({
  classId,
  activityType,
  existing,
}: ActivityFormOrganismProps) {
  const router = useRouter();
  const { addActivity } = useLmsSession();
  const isGraded = activityType === "quiz" || activityType === "assignment";

  const [visibility, setVisibility] = useState<StudentVisibilityMode>(
    existing?.options?.studentVisibilityMode ?? "All Students",
  );
  const [title, setTitle] = useState(existing?.title ?? "");
  const [topic, setTopic] = useState(existing?.topic ?? "");
  const [termName, setTermName] = useState(existing?.termName ?? "1st Term");
  const [categoryName, setCategoryName] = useState(
    existing?.categoryName ?? (activityType === "quiz" ? "Quiz" : "Assignment"),
  );
  const [publishedDate, setPublishedDate] = useState(
    existing?.publishedDate ?? "2026-11-17T08:00",
  );
  const [deadline, setDeadline] = useState(existing?.deadline ?? "2027-11-17T08:00");
  const [points, setPoints] = useState(String(existing?.points ?? 100));
  const [description, setDescription] = useState(existing?.description ?? "");
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  // Full Vue ActivityOptions state (ActivityMoreOptions.vue 1:1)
  const [timeLimit, setTimeLimit] = useState(String(existing?.options?.timeLimit ?? 0));
  const [proctoring, setProctoring] = useState(Boolean(existing?.options?.proctoring));
  const [revealAnswers, setRevealAnswers] = useState(Boolean(existing?.options?.revealAnswers));
  const [shuffleQuestions, setShuffleQuestions] = useState(
    Boolean(existing?.options?.shuffleQuestions),
  );
  const [autoComputeQuizScore, setAutoComputeQuizScore] = useState(
    existing?.options?.autoComputeQuizScore ?? true,
  );
  const [askForFeedback, setAskForFeedback] = useState(Boolean(existing?.options?.askForFeedback));
  const [noDeadline, setNoDeadline] = useState(existing?.noDeadline ?? false);
  const [disableDownload, setDisableDownload] = useState(
    Boolean(existing?.options?.disableDownloadAttachedFiles),
  );

  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(
    existing?.questions ?? [createBlankQuestion("multiple-choice", 1)],
  );

  const totalQuizPoints =
    activityType === "quiz"
      ? questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)
      : Number(points) || 0;

  const typeLabel =
    activityType === "quiz"
      ? "Quiz"
      : activityType === "assignment"
        ? "Assignment"
        : "Material";

  const handleAddQuestionType = (type: QuestionType) => {
    setQuestions((prev) => [...prev, createBlankQuestion(type, prev.length + 1)]);
    setAddDropdownOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const effectiveNoDeadline = activityType === "material" || noDeadline;
    addActivity({
      classId,
      type: activityType,
      title: title.trim() || `Untitled ${typeLabel}`,
      topic: topic.trim() || title.trim() || "General",
      termName: isGraded ? termName : "—",
      categoryName: isGraded ? categoryName : "—",
      publishedDate,
      deadline: effectiveNoDeadline ? null : deadline,
      noDeadline: effectiveNoDeadline,
      points: totalQuizPoints,
      description,
      options: {
        timeLimit: Number(timeLimit) || 0,
        proctoring,
        revealAnswers,
        shuffleQuestions,
        autoComputeQuizScore,
        askForFeedback,
        noDeadline: effectiveNoDeadline,
        disableDownloadAttachedFiles: disableDownload,
        studentVisibilityMode: visibility,
      },
      questions: activityType === "quiz" ? questions : undefined,
    });
    router.push(`/class/view/${classId}/activities`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/class/view/${classId}/activities`}
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          &lt; Back to Activities
        </Link>
      </div>

      {/* Main Header & Metadata Card (CreateActivityForm.vue 1:1) */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {existing ? "Edit" : "Create"} {typeLabel}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {activityType === "quiz" ? (
              <Link
                href="/chat"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-3 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate with AI</span>
              </Link>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-black"
            >
              {existing ? "Save Changes" : "Create"}
            </button>
            <Link
              href={`/class/view/${classId}/activities`}
              className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        {isGraded ? (
          <div className="flex items-center justify-between bg-sky-50 px-6 py-2 text-xs font-bold text-sky-900">
            <span>Total {typeLabel} Points:</span>
            <span className="font-mono">{totalQuizPoints}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Who can see this Activity?
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as StudentVisibilityMode)}
              className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 focus:border-orange-500 focus:bg-white focus:outline-none"
            >
              <option value="All Students">All Students</option>
              <option value="Only one or multiple students">Only one or multiple students</option>
              <option value="Only students with permit">Only students with permit</option>
              <option value="Except one or multiple students">Except one or multiple students</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Publish Date and Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            {isGraded && !noDeadline ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Deadline Date and Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${typeLabel.toLowerCase()} title...`}
              className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {activityType !== "material" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Choose or add a topic"
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          ) : null}

          {isGraded ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Classwork Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="select a category"
                  className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Term <span className="text-red-500">*</span>
                </label>
                <select
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-100/80 px-3 text-sm text-gray-800 focus:border-orange-500 focus:bg-white focus:outline-none"
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                </select>
              </div>
            </>
          ) : null}

          {/* Full Vue ActivityMoreOptions.vue 1:1 */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setMoreOptionsOpen((p) => !p)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${moreOptionsOpen ? "rotate-90" : ""}`}
              />
              <span>More Options</span>
            </button>

            {moreOptionsOpen ? (
              <div className="mt-3 space-y-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                {activityType === "assignment" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Total Points</label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      className="mt-1 h-9 w-48 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    />
                  </div>
                ) : null}

                {activityType === "quiz" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700">
                        Time limit in minutes (0 means unlimited)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        className="mt-1 h-9 w-48 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {[
                        { label: "Proctor This", checked: proctoring, setter: setProctoring },
                        {
                          label: "Reveal Correct Answers and Questions",
                          checked: revealAnswers,
                          setter: setRevealAnswers,
                        },
                        {
                          label: "Shuffle Questions",
                          checked: shuffleQuestions,
                          setter: setShuffleQuestions,
                        },
                        {
                          label: "Auto-compute quiz score",
                          checked: autoComputeQuizScore,
                          setter: setAutoComputeQuizScore,
                        },
                      ].map((opt) => (
                        <label
                          key={opt.label}
                          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={opt.checked}
                            onChange={(e) => opt.setter(e.target.checked)}
                            className="h-4 w-4 rounded accent-orange-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {activityType !== "material" ? (
                    <>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={askForFeedback}
                          onChange={(e) => setAskForFeedback(e.target.checked)}
                          className="h-4 w-4 rounded accent-orange-500"
                        />
                        <span>Ask Feedback</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={noDeadline}
                          onChange={(e) => setNoDeadline(e.target.checked)}
                          className="h-4 w-4 rounded accent-orange-500"
                        />
                        <span>No Deadline</span>
                      </label>
                    </>
                  ) : null}
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={disableDownload}
                      onChange={(e) => setDisableDownload(e.target.checked)}
                      className="h-4 w-4 rounded accent-orange-500"
                    />
                    <span>Disable Download Attached Files</span>
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {activityType === "quiz" ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleAddQuestionType("multiple-choice")}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Section Question</span>
          </button>

          {/* Section Card matching SectionQuestion.vue + ActivityTypeDropdown.vue 1:1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-xs font-bold text-white">
                  1
                </span>
                <h3 className="text-sm font-bold text-gray-900">Section 1</h3>
              </div>
              <button
                type="button"
                onClick={() => handleAddQuestionType("multiple-choice")}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {questions.map((q, idx) => (
                <QuestionEditorCard
                  key={q.id}
                  question={q}
                  index={idx}
                  onChange={(updated) => {
                    const next = [...questions];
                    next[idx] = updated;
                    setQuestions(next);
                  }}
                  onDuplicate={() =>
                    setQuestions((prev) => [
                      ...prev,
                      { ...q, id: `q-copy-${Date.now()}-${prev.length}` },
                    ])
                  }
                  onRemove={() =>
                    setQuestions((prev) => prev.filter((item) => item.id !== q.id))
                  }
                />
              ))}

              {/* Vue ActivityTypeDropdown.vue 7 Question Types Selector */}
              <div className="relative flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setAddDropdownOpen((prev) => !prev)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>{questions.length > 0 ? "Add Another Question" : "Add Question"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {addDropdownOpen ? (
                  <div className="animate-dropdown-enter absolute bottom-full z-30 mb-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                    {QUESTION_TYPE_LIST.map((qType) => (
                      <button
                        key={qType}
                        type="button"
                        onClick={() => handleAddQuestionType(qType)}
                        className="flex w-full items-center px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        {QUESTION_TYPE_LABELS[qType]}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-bold text-gray-900">
            Instructions &amp; Content
          </label>
          <RichTextEditor
            variant="full"
            value={description}
            onChange={setDescription}
            placeholder="Write instructions, rubric notes, or study material text..."
            ariaLabel="Activity description HTML editor"
          />
        </div>
      )}
    </form>
  );
}
