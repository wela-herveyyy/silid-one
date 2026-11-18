"use client";

import { Archive, ArrowLeft, ChevronDown, Home, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ClassCard } from "@/components/molecules/ClassCard";
import { ExternalCourseCard } from "@/components/molecules/ExternalCourseCard";
import type { ClassCardItem, ExternalCourseItem, UserRole } from "@/types/lms";

type ViewMode = "all" | "external" | "normal" | "sms";
type SortMode = "newest" | "name-asc" | "students-desc";

interface ClassListsSectionProps {
  userName: string;
  classes: ClassCardItem[];
  externalCourses: ExternalCourseItem[];
  role: UserRole;
  designTheme?: "modern" | "playful";
  archivesMode?: boolean;
  onToggleArchive: (id: string) => void;
}

export function ClassListsSection({
  userName,
  classes,
  externalCourses,
  role,
  designTheme = "modern",
  archivesMode = false,
  onToggleArchive,
}: ClassListsSectionProps) {
  const [classListView, setClassListView] = useState<ViewMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolYear, setSchoolYear] = useState("all");
  const [sortBy, setSortBy] = useState<SortMode>("newest");

  const firstName = userName.split(" ")[0] || userName;
  const publishedExternal = useMemo(
    () => externalCourses.filter((c) => c.status === "published"),
    [externalCourses],
  );

  const scopedClasses = useMemo(
    () => classes.filter((item) => Boolean(item.archived) === archivesMode),
    [classes, archivesMode],
  );

  const schoolYears = useMemo(
    () => Array.from(new Set(scopedClasses.map((c) => c.schoolYear))).sort().reverse(),
    [scopedClasses],
  );

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = scopedClasses.filter((item) => {
      if (classListView === "normal" && item.kind !== "normal") return false;
      if (classListView === "sms" && item.kind !== "sms") return false;
      if (classListView === "external") return false;
      if (schoolYear !== "all" && item.schoolYear !== schoolYear) return false;
      if (!q) return true;
      return (
        item.subjectName.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.sectionName.toLowerCase().includes(q)
      );
    });

    if (sortBy === "name-asc") {
      return [...list].sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    }
    if (sortBy === "students-desc") {
      return [...list].sort((a, b) => b.studentCount - a.studentCount);
    }
    return list;
  }, [scopedClasses, classListView, schoolYear, searchQuery, sortBy]);

  const filteredExternal = useMemo(() => {
    if (archivesMode || (classListView !== "all" && classListView !== "external")) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return publishedExternal;
    return publishedExternal.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.gradeLabel.toLowerCase().includes(q),
    );
  }, [archivesMode, classListView, searchQuery, publishedExternal]);

  const normalClasses = useMemo(
    () => filteredClasses.filter((c) => c.kind === "normal"),
    [filteredClasses],
  );
  const smsClasses = useMemo(
    () => filteredClasses.filter((c) => c.kind === "sms"),
    [filteredClasses],
  );

  const viewToggleClass = (mode: ViewMode) => {
    const active = classListView === mode;
    return `flex-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:text-sm lg:flex-none lg:rounded-lg lg:px-3.5 lg:py-2 ${
      active
        ? "bg-white text-orange-600 shadow-sm lg:bg-orange-50 lg:text-orange-600 lg:ring-1 lg:ring-orange-200"
        : "text-gray-600 hover:text-gray-900 lg:hover:bg-gray-100"
    }`;
  };

  const smsCount = scopedClasses.filter((c) => c.kind === "sms").length;
  const silidCount = scopedClasses.filter((c) => c.kind === "normal").length;
  const canAccessExternal = role === "Student" || role === "Teacher" || role === "Admin";

  return (
    <div className="w-full pb-6 pt-4 sm:pb-8 sm:pt-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8">
        <div className="min-w-0 text-left">
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-gray-900 sm:text-[30px] lg:text-[36px]">
            {archivesMode ? (
              <>
                Class <span className="text-orange-500">Archives</span>
              </>
            ) : (
              <>
                Welcome,<span className="text-orange-500">&nbsp;{firstName}</span>
              </>
            )}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] font-normal leading-relaxed text-gray-600 sm:text-base lg:text-[17px]">
            {archivesMode
              ? "Review archived sections and restore past classes whenever you need them."
              : "Find your classrooms, refine with filters, or switch to external courses whenever you need them."}
          </p>
          <p className="mt-3 max-w-md text-sm leading-snug text-gray-500">
            {smsCount} SMS classes · {silidCount} Silid classes
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href={archivesMode ? "/class" : "/class/archives"}
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              {archivesMode ? (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back to current classes
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  View class archives
                </>
              )}
            </Link>
            {!archivesMode && (role === "Teacher" || role === "Admin") ? (
              <Link
                href="/class/create"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
              >
                + Create class
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:max-w-xl lg:gap-4">
          <div
            className="inline-flex w-full rounded-xl bg-gray-100 p-1 lg:w-auto lg:shrink-0 lg:gap-2 lg:rounded-none lg:bg-transparent lg:p-0"
            role="tablist"
            aria-label="Class list view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={classListView === "all"}
              className={viewToggleClass("all")}
              onClick={() => setClassListView("all")}
            >
              <span className="sm:hidden">All</span>
              <span className="hidden sm:inline">All classes</span>
            </button>
            {canAccessExternal && !archivesMode ? (
              <button
                type="button"
                role="tab"
                aria-selected={classListView === "external"}
                className={viewToggleClass("external")}
                onClick={() => setClassListView("external")}
              >
                External
              </button>
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={classListView === "normal"}
              className={viewToggleClass("normal")}
              onClick={() => setClassListView("normal")}
            >
              <span className="sm:hidden">Normal</span>
              <span className="hidden sm:inline">Normal classes</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={classListView === "sms"}
              className={viewToggleClass("sms")}
              onClick={() => setClassListView("sms")}
            >
              <span className="sm:hidden">SMS</span>
              <span className="hidden sm:inline">SMS classes</span>
            </button>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 lg:max-w-none lg:flex-1 lg:flex-wrap lg:justify-end lg:gap-3">
            <div className="relative min-w-0 flex-1 lg:w-64 lg:max-w-xs lg:flex-none">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                autoComplete="off"
                className="min-h-[44px] w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-base text-gray-900 transition-colors duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:min-h-0 sm:text-sm"
                placeholder="Search classes..."
              />
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <select
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  aria-label="Filter by school year"
                  className="min-h-[44px] appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-orange-500 focus:outline-none sm:min-h-0 sm:text-sm"
                >
                  <option value="all">School year</option>
                  {schoolYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortMode)}
                  aria-label="Sort"
                  className="min-h-[44px] appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-orange-500 focus:outline-none sm:min-h-0 sm:text-sm"
                >
                  <option value="newest">Sort</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="students-desc">Most students</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {schoolYear !== "all" || sortBy !== "newest" ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:col-span-2">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">Active:</span>
            {schoolYear !== "all" ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 sm:text-sm">
                <span>{schoolYear}</span>
                <button
                  type="button"
                  onClick={() => setSchoolYear("all")}
                  aria-label="Remove school year filter"
                  className="rounded-full p-0.5 hover:bg-orange-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            {sortBy !== "newest" ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
                <span>{sortBy === "name-asc" ? "Name A–Z" : "Most students"}</span>
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  aria-label="Clear sort"
                  className="rounded-full p-0.5 hover:bg-blue-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setSchoolYear("all");
                setSortBy("newest");
                setSearchQuery("");
              }}
              className="text-xs font-medium text-gray-600 underline hover:text-gray-900 sm:text-sm"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-14">
        {filteredExternal.length > 0 ? (
          <section>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredExternal.map((course) => (
                <ExternalCourseCard
                  key={course.id}
                  course={course}
                  designTheme={designTheme}
                />
              ))}
            </div>
          </section>
        ) : null}

        {normalClasses.length > 0 ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Silid classes</h3>
              <span className="text-xs font-medium text-gray-500">
                {normalClasses.length} classes
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {normalClasses.map((item) => (
                <ClassCard
                  key={item.id}
                  item={item}
                  designTheme={designTheme}
                  onToggleArchive={onToggleArchive}
                />
              ))}
            </div>
          </section>
        ) : null}

        {smsClasses.length > 0 ? (
          <section className="space-y-10">
            {Array.from(
              smsClasses.reduce((groups, cls) => {
                const key = `${cls.sectionName} · SY ${cls.schoolYear}`;
                const arr = groups.get(key) ?? [];
                arr.push(cls);
                groups.set(key, arr);
                return groups;
              }, new Map<string, ClassCardItem[]>()),
            ).map(([sectionKey, groupItems]) => (
              <div key={sectionKey} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span>{sectionKey}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-orange-300 hover:text-orange-600"
                    >
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>Sync all</span>
                    </button>
                    <span className="text-xs font-medium text-gray-400">
                      {groupItems.length} {groupItems.length === 1 ? "subject" : "subjects"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupItems.map((item) => (
                    <ClassCard
                      key={item.id}
                      item={item}
                      designTheme={designTheme}
                      onToggleArchive={onToggleArchive}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
