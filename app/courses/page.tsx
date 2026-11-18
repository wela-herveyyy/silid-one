"use client";

import { ArrowRight, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MainNavbar } from "@/components/organisms/MainNavbar";
import { ThemeSidebar } from "@/components/organisms/ThemeSidebar";
import { GiyaChatDrawer } from "@/components/organisms/GiyaChatDrawer";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function CoursesCatalogPage() {
  const {
    user,
    role,
    setRole,
    designTheme,
    setDesignTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    externalCourses,
    giyaDrawerOpen,
    setGiyaDrawerOpen,
  } = useLmsSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [themeOpen, setThemeOpen] = useState(false);

  const published = useMemo(
    () => externalCourses.filter((c) => c.status === "published"),
    [externalCourses],
  );

  const grades = useMemo(
    () => Array.from(new Set(published.map((c) => c.gradeLabel))),
    [published],
  );
  const topics = useMemo(
    () => Array.from(new Set(published.flatMap((c) => c.topicTags))),
    [published],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return published.filter((c) => {
      if (selectedGrade !== "all" && c.gradeLabel !== selectedGrade) return false;
      if (selectedTopic !== "all" && !c.topicTags.includes(selectedTopic)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.topicTags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [published, searchQuery, selectedGrade, selectedTopic]);

  return (
    <div className="min-h-screen bg-gray-50/40">
      <MainNavbar
        userName={user.name}
        schoolName={user.schoolName}
        role={role}
        onRoleChange={setRole}
        designTheme={designTheme}
        onDesignThemeChange={setDesignTheme}
        onOpenAppearance={() => setThemeOpen(true)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onOpenGiya={() => setGiyaDrawerOpen(true)}
      />

      {/* Hero Banner matching CoursesHeroBanner.vue / vue_courses.png 1:1 */}
      <section
        className="relative z-0 w-full max-w-full overflow-hidden bg-[#da600e]/[0.95] text-white"
        style={{ minHeight: "clamp(130px, 22vw, 220px)" }}
      >
        <div
          className="relative mx-auto flex w-full items-center justify-between"
          style={{ height: "clamp(130px, 22vw, 220px)" }}
        >
          <div className="relative hidden h-full flex-1 items-end justify-start overflow-hidden xl:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/Lessons_Boy.png"
              alt="Courses boy illustration"
              className="relative z-10 h-full w-auto object-contain object-left"
              style={{ maxHeight: "220px", maxWidth: "min(26vw, 360px)" }}
            />
          </div>

          <div className="relative z-30 w-full flex-1 px-4 text-center xl:w-auto xl:flex-1">
            <div className="mx-auto max-w-3xl">
              <h1 className="whitespace-nowrap font-black leading-tight text-[clamp(22px,6vw,40px)] md:text-[clamp(28px,4vw,52px)] lg:text-[clamp(32px,3vw,56px)]">
                Discover Something New Today
              </h1>
              <p className="mt-3 whitespace-nowrap font-light text-[clamp(12px,3vw,16px)] md:text-[clamp(14px,2.5vw,18px)] lg:text-[clamp(15px,2vw,20px)]">
                Explore courses that organize lessons and activities for your class.
              </p>
            </div>
          </div>

          <div className="relative hidden h-full flex-1 items-end justify-end overflow-hidden xl:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/Lessons_Girl.png"
              alt="Courses girl illustration"
              className="relative z-10 h-full w-auto object-contain object-right"
              style={{ maxHeight: "220px", maxWidth: "min(26vw, 360px)" }}
            />
          </div>
        </div>
      </section>

      {/* Filter Bar + Courses Grid matching CourseView.vue / vue_courses.png */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="px-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Courses, topics, tags…"
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                />
              </div>
            </div>

            <div className="hidden h-10 w-px shrink-0 self-end bg-gray-100 sm:block" />

            <div className="flex w-full shrink-0 flex-col gap-1 sm:w-44">
              <span className="px-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Grade Level
              </span>
              <select
                aria-label="Grade level"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 focus:border-orange-400 focus:outline-none"
              >
                <option value="all">All Grade Levels</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-1 sm:w-44">
              <span className="px-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Subject
              </span>
              <select
                aria-label="Subject topic"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 focus:border-orange-400 focus:outline-none"
              >
                <option value="all">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs font-semibold text-gray-500">
          <span className="font-bold text-gray-900">{filtered.length}</span> courses found
        </p>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const color = course.accentColor || "#f97316";
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="flex h-44 items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-base font-bold text-gray-900">
                    {course.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-gray-400">
                    {course.description}
                  </p>
                  <div
                    className="mt-5 flex items-center gap-1.5 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <GiyaChatDrawer open={giyaDrawerOpen} onClose={() => setGiyaDrawerOpen(false)} />
      <ThemeSidebar
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        designTheme={designTheme}
        onDesignThemeChange={setDesignTheme}
      />
    </div>
  );
}
