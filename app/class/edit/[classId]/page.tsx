"use client";

import { ArrowLeft, BookOpen, Image as ImageIcon, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClassCard } from "@/components/molecules/ClassCard";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { ClassCardItem } from "@/types/lms";

const SWATCH_ROWS = [
  ["#f43f5e", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#d946ef"],
  ["#fda4af", "#fdba74", "#fde047", "#86efac", "#6ee7b7", "#5eead4", "#7dd3fc", "#93c5fd", "#c4b5fd", "#f0abfc"],
  ["#9f1239", "#7c2d12", "#3f6212", "#14532d", "#134e4a", "#1e3a8a", "#312e81", "#581c87", "#4c1d95", "#4a044e"],
];

export default function EditClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes, updateClass } = useLmsSession();
  const decodedId = (() => {
    try {
      return decodeURIComponent(classId);
    } catch {
      return classId;
    }
  })();
  const current = classes.find((c) => c.id === classId || c.id === decodedId) ?? classes[0];

  if (!current) {
    return (
      <DashboardTemplate>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading class details…
        </div>
      </DashboardTemplate>
    );
  }

  return <EditClassForm key={current.id} current={current} updateClass={updateClass} />;
}

function EditClassForm({
  current,
  updateClass,
}: {
  current: ClassCardItem;
  updateClass: (id: string, patch: Partial<ClassCardItem>) => void;
}) {
  const router = useRouter();
  const [subjectName, setSubjectName] = useState(current.subjectName);
  const [sectionName, setSectionName] = useState(current.sectionName);
  const [schedule, setSchedule] = useState(current.schedule);
  const [accentColor, setAccentColor] = useState(current.accentColor || "#f48618");
  const [previewTheme, setPreviewTheme] = useState<"playful" | "modern">("modern");
  const [editorTab, setEditorTab] = useState<"color" | "cover" | "info">("color");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateClass(current.id, {
      subjectName: subjectName.trim() || current.subjectName,
      sectionName: sectionName.trim() || current.sectionName,
      schedule: schedule.trim() || current.schedule,
      accentColor,
    });
    router.push("/class");
  };

  const previewItem = {
    ...current,
    subjectName,
    sectionName,
    schedule,
    accentColor,
  };

  return (
    <DashboardTemplate>
      <form onSubmit={handleSave} className="space-y-6 pb-12">
        <Link
          href="/class"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to classes</span>
        </Link>

        {/* Top Header matching live_08_class_edit.png */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Class Settings
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Edit Class Appearance
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the class color and cover image from one clean editor. Changes are applied when
              you save.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/class"
              className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Save changes
            </button>
          </div>
        </div>

        {/* 2-Column Split Editor matching live_08_class_edit.png */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Live Card Preview */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-4 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Live preview</h2>
              <p className="text-xs text-gray-500">
                This is how the class card will look after save.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setPreviewTheme("playful")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  previewTheme === "playful"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("modern")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  previewTheme === "modern"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Modern
              </button>
            </div>

            <div className="max-w-xs">
              <ClassCard item={previewItem} designTheme={previewTheme} />
            </div>
          </div>

          {/* Right Column: Appearance Editor */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-8">
            <div className="p-6 space-y-5 flex-1">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Appearance editor</h2>
                <p className="text-xs text-gray-500">
                  Choose a theme color, upload a cover image, or view class details.
                </p>
              </div>

              {/* Editor Mode Pill Tabs */}
              <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setEditorTab("color")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    editorTab === "color"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span>Theme Color</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("cover")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    editorTab === "cover"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Cover Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("info")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    editorTab === "info"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Class Info</span>
                </button>
              </div>

              {editorTab === "color" ? (
                <div className="space-y-5">
                  <div
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                    style={{
                      borderColor: `${accentColor}40`,
                      backgroundColor: `${accentColor}12`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-10 w-10 rounded-xl border-2 border-white shadow-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Active Theme
                        </p>
                        <p className="font-mono text-sm font-bold text-gray-900 uppercase">
                          {accentColor}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 shadow-sm">
                      ● Selected
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {SWATCH_ROWS.map((row, rowIdx) => (
                      <div key={rowIdx} className="grid grid-cols-5 gap-2.5 sm:grid-cols-10">
                        {row.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setAccentColor(hex)}
                            aria-label={`Select color ${hex}`}
                            className={`h-9 w-full rounded-lg transition-transform hover:scale-105 ${
                              accentColor.toLowerCase() === hex.toLowerCase()
                                ? "ring-2 ring-gray-900 ring-offset-2"
                                : ""
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {editorTab === "cover" ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">Upload Cover Artwork</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended 1200×640 PNG or JPG. Color gradient fallback remains active.
                  </p>
                </div>
              ) : null}

              {editorTab === "info" ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-subject" className="block text-xs font-bold text-gray-700">
                      Subject Name
                    </label>
                    <input
                      id="edit-subject"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="edit-section" className="block text-xs font-bold text-gray-700">
                        Section
                      </label>
                      <input
                        id="edit-section"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-schedule" className="block text-xs font-bold text-gray-700">
                        Schedule
                      </label>
                      <input
                        id="edit-schedule"
                        value={schedule}
                        onChange={(e) => setSchedule(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 border-t border-orange-100 bg-orange-50/50 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Pro tip: High-contrast colors help students navigate faster.</span>
            </div>
          </div>
        </div>
      </form>
    </DashboardTemplate>
  );
}
