"use client";

import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

const COLOR_SWATCHES = [
  "#ff0000", "#ffa500", "#ffff00", "#008000", "#0000ff", "#4b0082", "#ee82ee", "#00e5ff",
  "#ff7f7f", "#ff9e44", "#fbc02d", "#9ccc65", "#26d07c", "#1de9b6", "#64b5f6", "#5c6bc0",
  "#9575cd", "#ba68c8", "#e066ff", "#880e4f", "#6a1b9a", "#7f3300",
];

export default function CreateClassPage() {
  const router = useRouter();
  const { addClass, user } = useLmsSession();
  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [sectionName, setSectionName] = useState("Grade 11 - Narra");
  const [tab, setTab] = useState<"color" | "image">("color");
  const [accentColor, setAccentColor] = useState("#ea580c");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = addClass({
      subjectName: subjectName.trim() || "New Class",
      subjectCode: "SUBJ-101",
      sectionName: sectionName.trim() || "Grade 11 - Narra",
      schoolYear: "2026-2027",
      teacherName: user.name,
      schedule: "MWF 09:00 - 10:00",
      studentCount: 30,
      kind: "normal",
      accentColor,
    });
    router.push(`/class/view/${id}`);
  };

  return (
    <DashboardTemplate>
      <div className="space-y-4">
        <section className="flex w-full items-center gap-3 py-4">
          <ChevronsRight className="h-5 w-5 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Create Class</h1>
        </section>

        {/* Main Card matching CreateClassView.vue / vue_class_create.png */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 className="text-lg font-medium text-gray-900">Class Details</h2>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-md bg-gray-900 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black"
              >
                Save
              </button>
              <Link
                href="/class"
                className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label htmlFor="cls-name" className="block text-xs font-bold text-gray-700">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                id="cls-name"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Placeholder"
                className="mt-1.5 h-11 w-full rounded-lg bg-gray-100 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label htmlFor="cls-desc" className="block text-xs font-bold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cls-desc"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Placeholder"
                className="mt-1.5 w-full rounded-lg bg-gray-100 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label htmlFor="cls-sec" className="block text-xs font-bold text-gray-700">
                Section
              </label>
              <input
                id="cls-sec"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg bg-gray-100 px-3.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="flex gap-4 border-b border-gray-200 px-5 pt-3 text-sm">
                <button
                  type="button"
                  onClick={() => setTab("color")}
                  className={`border-b-2 pb-2.5 font-medium transition-colors ${
                    tab === "color"
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Color
                </button>
                <button
                  type="button"
                  onClick={() => setTab("image")}
                  className={`border-b-2 pb-2.5 font-medium transition-colors ${
                    tab === "image"
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Image
                </button>
              </div>

              <div className="p-5">
                {tab === "color" ? (
                  <div className="flex flex-wrap gap-3">
                    {COLOR_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Color ${hex}`}
                        onClick={() => setAccentColor(hex)}
                        className={`h-12 w-12 rounded-lg transition-transform hover:scale-105 ${
                          accentColor === hex ? "ring-2 ring-gray-900 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Optional cover banners can be uploaded after class creation.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardTemplate>
  );
}
