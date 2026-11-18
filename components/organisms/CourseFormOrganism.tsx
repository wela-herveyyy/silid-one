"use client";

import { Check, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { ExternalCourseItem } from "@/types/lms";

interface CourseFormOrganismProps {
  existing?: ExternalCourseItem;
}

const STEPS = [
  { num: 1, label: "Overview" },
  { num: 2, label: "Curriculum" },
  { num: 3, label: "Course Settings" },
  { num: 4, label: "Visuals" },
];

const COLORS = ["#ea580c", "#8b5cf6", "#0284c7", "#16a34a", "#db2777", "#d97706"];

export function CourseFormOrganism({ existing }: CourseFormOrganismProps) {
  const router = useRouter();
  const { addCourse, user } = useLmsSession();

  const [step, setStep] = useState(1);
  const [isExternal, setIsExternal] = useState(false);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [gradeLabel, setGradeLabel] = useState(existing?.gradeLabel ?? "Grade 11");
  const [topicsText, setTopicsText] = useState(
    existing?.topicTags.join(", ") ?? "Enrichment",
  );
  const [referenceUrl, setReferenceUrl] = useState(existing?.referenceUrl ?? "");
  const [accentColor, setAccentColor] = useState(existing?.accentColor ?? "#ea580c");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    if (!existing) {
      addCourse({
        title: title.trim() || "Untitled course",
        gradeLabel: gradeLabel.trim() || "K-12",
        description: description.trim() || "Guided enrichment course.",
        topicTags: topicsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorName: user.name,
        status: "draft",
        referenceUrl: referenceUrl.trim() || "https://example.org/course",
        accentColor,
      });
    }
    router.push("/courses/manage");
  };

  const activeStepName = STEPS[step - 1]?.label ?? "Overview";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-10 pb-12 pt-4">
      {/* Top Bar matching CourseCreateView.vue / vue_courses_create.png */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-orange-600">
              {existing ? "Editing Course" : "Creating a New Course"}
            </h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 text-orange-500">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500">
            Step {step} of 4 — {activeStepName}
          </p>

          <label className="inline-flex cursor-pointer items-center gap-3 pt-1 text-xs font-semibold text-gray-600">
            <span>External</span>
            <button
              type="button"
              role="switch"
              aria-checked={isExternal}
              onClick={() => setIsExternal((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isExternal ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isExternal ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        <Link
          href="/courses/manage"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-800"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel Creation</span>
        </Link>
      </div>

      {/* Stepper Indicator */}
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {STEPS.map((item, idx) => {
          const done = step > item.num;
          const active = step === item.num;
          return (
            <div key={item.num} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => setStep(item.num)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    active || done
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : item.num}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    active ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
              {idx < STEPS.length - 1 ? (
                <div className="mx-2 mb-5 h-px flex-1 bg-gray-200" />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-8">
        {step === 1 ? (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-3">
              <label
                htmlFor="course-title"
                className="block text-[11px] font-bold uppercase tracking-widest text-orange-500"
              >
                Course Title
              </label>
              <input
                id="course-title"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title..."
                className="mt-3 w-full bg-transparent text-3xl font-extrabold text-gray-900 placeholder:text-gray-200 focus:outline-none sm:text-4xl"
              />
              <p className="mt-2 text-right font-mono text-xs text-gray-400">
                {title.length}/100
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <label
                htmlFor="course-desc"
                className="block text-[11px] font-bold uppercase tracking-widest text-orange-500"
              >
                Description
              </label>
              <textarea
                id="course-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                className="mt-3 w-full resize-none bg-transparent text-base text-gray-800 placeholder:text-gray-300 focus:outline-none"
              />
              <p className="mt-2 text-right font-mono text-xs text-gray-400">
                {description.length}
              </p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">Curriculum Outline</h2>
            <p className="text-sm text-gray-500">
              After saving, add week modules and lesson content in the Lesson Editor.
            </p>
            {isExternal ? (
              <div>
                <label htmlFor="course-ref" className="block text-xs font-semibold text-gray-700">
                  External Resource URL
                </label>
                <input
                  id="course-ref"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            <div>
              <label htmlFor="course-grade" className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                Grade Level
              </label>
              <input
                id="course-grade"
                value={gradeLabel}
                onChange={(e) => setGradeLabel(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="course-topics" className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                Topics
              </label>
              <input
                id="course-topics"
                value={topicsText}
                onChange={(e) => setTopicsText(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Course Theme Color
            </h2>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccentColor(hex)}
                  aria-label={`Select color ${hex}`}
                  className={`h-11 w-11 rounded-xl transition-transform hover:scale-105 ${
                    accentColor === hex ? "ring-2 ring-gray-900 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex h-10 items-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
        >
          {step < 4 ? "Continue" : existing ? "Save Changes" : "Create Course"}
        </button>
      </div>
    </form>
  );
}
