"use client";

import {
  Archive,
  BookOpen,
  Calendar,
  Edit2,
  Eye,
  Grid,
  List,
  Plus,
  RotateCcw,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { CourseStatus } from "@/types/lms";

type CourseFilter = "all" | CourseStatus;
type CourseSort = "newest" | "oldest" | "alpha";

export default function ManageCoursesPage() {
  const { externalCourses, setCourseStatus } = useLmsSession();
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [sortBy, setSortBy] = useState<CourseSort>("newest");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = externalCourses.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    });
    if (sortBy === "alpha") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === "oldest") {
      return [...list].reverse();
    }
    return list;
  }, [externalCourses, filter, search, sortBy]);

  const filterTabs: Array<{ value: CourseFilter; label: string }> = [
    { value: "all", label: "All Courses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Unpublished" },
    { value: "archived", label: "Archived" },
  ];

  const statusMeta = (status: CourseStatus) => {
    if (status === "published") {
      return { label: "Published", badgeCls: "bg-green-50 text-green-600" };
    }
    if (status === "draft") {
      return { label: "Draft", badgeCls: "bg-blue-50 text-blue-600" };
    }
    return { label: "Archived", badgeCls: "bg-gray-100 text-gray-500" };
  };

  return (
    <DashboardTemplate>
      <div className="space-y-6">
        {/* Header matching ManageCourseView.vue */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Silid 3D Printing Lesson Plan
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-[45px]">
              Course Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Publish, update, and organize curriculum courses for your school.
            </p>
          </div>

          <Link
            href="/courses/create"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Link>
        </div>

        {/* Filter Bar matching CourseFilterBar.vue */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-200 ${
                  filter === tab.value
                    ? "border border-orange-500 bg-orange-500 text-white"
                    : "border border-gray-300 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:gap-3">
            <select
              aria-label="Sort courses"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CourseSort)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alpha">Title (A–Z)</option>
            </select>

            <div className="relative flex-1 sm:w-[220px] sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode("list")}
                className={`border-l border-gray-300 p-2 transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold text-gray-800">No courses found</p>
            <p className="mt-1 text-sm text-gray-500">
              No courses match your current search and filter settings.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View matching CourseFeatureList.vue 1:1 */
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-10">
            {filtered.map((course) => {
              const meta = statusMeta(course.status);
              const color = course.accentColor || "#F97316";
              return (
                <article
                  key={course.id}
                  className="group relative z-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link
                    href={`/courses/${course.id}`}
                    className="relative flex h-56 items-center justify-center overflow-hidden focus:outline-none"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-md bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-900 shadow-sm">
                      {meta.label}
                    </span>

                    {course.status !== "archived" ? (
                      <button
                        type="button"
                        aria-label="Archive course"
                        onClick={(e) => {
                          e.preventDefault();
                          setCourseStatus(course.id, "archived");
                        }}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-orange-500 backdrop-blur-sm transition-colors hover:bg-orange-50"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Restore course"
                        onClick={(e) => {
                          e.preventDefault();
                          setCourseStatus(course.id, "draft");
                        }}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-green-600 backdrop-blur-sm transition-colors hover:bg-green-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}

                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    >
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                  </Link>

                  <Link
                    href={`/courses/${course.id}`}
                    className="flex flex-1 flex-col overflow-hidden px-5 pb-6 pt-6 focus:outline-none"
                  >
                    <h3 className="mb-2 line-clamp-2 overflow-hidden text-lg font-bold leading-snug text-gray-900 transition-colors duration-200">
                      {course.title}
                    </h3>

                    <p className="mb-8 line-clamp-3 text-sm leading-snug text-gray-400">
                      {course.description || "No description"}
                    </p>

                    <div className="mt-auto">
                      <p className="mb-2 text-sm text-gray-500">{course.authorName}</p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{course.publishedAt}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-stretch gap-1 border-t border-gray-100 px-2 py-4">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Preview</span>
                    </Link>

                    <Link
                      href={`/courses/manage/${course.id}/edit`}
                      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setCourseStatus(
                          course.id,
                          course.status === "published" ? "draft" : "published",
                        )
                      }
                      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 font-semibold text-gray-500 transition-colors hover:bg-gray-50 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {course.status === "published" ? "Unpublish" : "Publish"}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}

            <article className="group rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
              <Link
                href="/courses/create"
                className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-2xl p-8 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Plus className="h-9 w-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-700">Create Course</h3>
                  <p className="text-sm text-gray-500">
                    Set up a new course outline and start building lessons.
                  </p>
                </div>
              </Link>
            </article>
          </div>
        ) : (
          /* List Table View matching ManageCourseView.vue table */
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="hidden px-5 py-3.5 md:table-cell">Author</th>
                    <th className="hidden px-5 py-3.5 sm:table-cell">Published</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((course) => {
                    const meta = statusMeta(course.status);
                    const color = course.accentColor || "#F97316";
                    return (
                      <tr key={course.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-5 py-4">
                          <Link href={`/courses/${course.id}`} className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${color}15`, color }}
                            >
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {course.title}
                              </p>
                              <p className="max-w-[240px] truncate text-xs text-gray-400">
                                {course.description || "No description"}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-500 md:table-cell">
                          {course.authorName || "—"}
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-500 sm:table-cell">
                          {course.publishedAt}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${meta.badgeCls}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/courses/${course.id}`}
                              title="Preview"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/courses/manage/${course.id}/edit`}
                              title="Edit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              title={course.status === "published" ? "Unpublish" : "Publish"}
                              onClick={() =>
                                setCourseStatus(
                                  course.id,
                                  course.status === "published" ? "draft" : "published",
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            {course.status !== "archived" ? (
                              <button
                                type="button"
                                title="Archive"
                                onClick={() => setCourseStatus(course.id, "archived")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Restore"
                                onClick={() => setCourseStatus(course.id, "draft")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardTemplate>
  );
}
