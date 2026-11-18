"use client";

import { ArrowRight, BookOpen, Grid, Search, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function GradeSchoolCoursesPage() {
  const { user, externalCourses } = useLmsSession();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCourses, setShowAllCourses] = useState(false);

  const firstName = user.name.split(" ")[0] || "Learner";
  const published = useMemo(
    () => externalCourses.filter((c) => c.status === "published"),
    [externalCourses],
  );

  const tabs = [
    { value: "all", label: "All Subjects" },
    { value: "STEM", label: "STEM & Robotics" },
    { value: "Design", label: "3D & Design" },
  ];

  const displayedCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return published.filter((c) => {
      if (activeTab !== "all" && !c.topicTags.some((t) => t.toLowerCase().includes(activeTab.toLowerCase()))) {
        return false;
      }
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    });
  }, [published, activeTab, searchQuery]);

  return (
    <DashboardTemplate>
      <div className="space-y-8 pb-8 pt-4">
        {/* Heading matching GradeSchoolView.vue */}
        <div>
          <h1 className="inline-flex items-center gap-2 text-[28px] font-extrabold tracking-tight text-gray-900">
            <span>
              Hey <span className="text-orange-500">{firstName}</span>, ready to explore?
            </span>
            <Zap className="h-7 w-7 text-orange-400" />
          </h1>
          <p className="mt-1.5 text-[15px] text-gray-500">Pick a course and let&apos;s dive in!</p>
        </div>

        {/* Neo-brutalist Tabs + Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {tabs.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex h-9 items-center whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "border-2 border-orange-300 bg-orange-500 text-white shadow-[2px_2px_0px_0px_#fdba74]"
                      : "border-2 border-gray-300 bg-white text-gray-600 shadow-[2px_2px_0px_0px_#d1d5db] hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 shadow-[2px_2px_0px_0px_#d1d5db] transition focus:border-gray-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAllCourses((p) => !p)}
              className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-all duration-300 ${
                showAllCourses
                  ? "scale-[1.02] border-2 border-orange-300 bg-orange-500 text-white shadow-[3px_3px_0px_0px_#fdba74]"
                  : "border-2 border-gray-300 bg-white text-gray-600 shadow-[2px_2px_0px_0px_#d1d5db] hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>{showAllCourses ? "Showing All" : "Show All Courses"}</span>
            </button>
          </div>
        </div>

        {/* GradeSchoolCourseCard Grid matching GradeSchoolCourseCard.vue 1:1 */}
        <div className="grid grid-cols-1 gap-x-9 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => {
            const color = course.accentColor || "#ea580c";
            return (
              <Link
                key={course.id}
                href={`/courses/grade-school/${course.id}`}
                className="group flex flex-col rounded-[20px] border-2 border-gray-600 bg-orange-50/60 px-6 pb-4 pt-5 shadow-[5px_5px_0px_0px_#4b5563] transition-all duration-200 hover:-translate-y-1 hover:border-orange-500 hover:shadow-[6px_8px_0px_0px_#f97316]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-300 shadow-[3px_3px_0px_0px_#d1d5db] transition-all duration-200 group-hover:scale-105 group-hover:border-orange-400"
                    style={{ backgroundColor: color }}
                  >
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="inline-flex items-center rounded-full border-2 border-gray-300 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-700 transition-colors duration-200 group-hover:border-orange-400 group-hover:text-orange-600">
                    {course.gradeLabel}
                  </span>
                </div>

                <span
                  className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color }}
                >
                  {course.topicTags[0] || "Enrichment"}
                </span>
                <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-gray-900">
                  {course.title}
                </h3>

                <div className="mt-5 border-t-2 border-dashed border-gray-200" />

                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs font-semibold text-gray-400">
                    {course.lessons.length}{" "}
                    {course.lessons.length === 1 ? "Lesson" : "Lessons"}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-400 transition-colors duration-200 group-hover:border-orange-500 group-hover:text-orange-500">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardTemplate>
  );
}
