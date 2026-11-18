"use client";

import {
  Archive,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  FileText,
  Filter,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ActivityRow } from "@/components/molecules/ActivityRow";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { ActivityClassification } from "@/types/lms";

type FilterType = "all" | ActivityClassification;

export default function ClassActivitiesPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes, activities, role, toggleDeleteActivity } = useLmsSession();
  const classItem = classes.find((c) => c.id === classId) ?? classes[0];
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const activeList = useMemo(() => {
    const filtered = activities.filter((a) => {
      if (a.deleted) return false;
      if (filter !== "all" && a.type !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.topic.toLowerCase().includes(q);
    });
    return sortAsc ? filtered : [...filtered].reverse();
  }, [activities, filter, search, sortAsc]);

  const isTeacher = role === "Teacher" || role === "Admin";

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        {/* Header matching vue_class_activities.png */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Classwork
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Activities
            </h2>
            {classItem?.subjectName ? (
              <p className="mt-0.5 text-sm text-gray-500">{classItem.subjectName}</p>
            ) : null}
          </div>

          {isTeacher ? (
            <div className="relative flex flex-wrap items-center gap-2">
              <Link
                href={`/class/view/${classId}/activities/deleted-activities`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Deleted</span>
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCreateMenuOpen((prev) => !prev)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Activity</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {createMenuOpen ? (
                  <div className="animate-dropdown-enter absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl ring-1 ring-black/[0.04]">
                    <Link
                      href={`/class/view/${classId}/activities/create/assignment`}
                      onClick={() => setCreateMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Assignment</span>
                    </Link>
                    <Link
                      href={`/class/view/${classId}/activities/create/quiz`}
                      onClick={() => setCreateMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Quiz</span>
                    </Link>
                    <Link
                      href={`/class/view/${classId}/activities/create/material`}
                      onClick={() => setCreateMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>Material</span>
                    </Link>
                    <Link
                      href="/activity-bank"
                      onClick={() => setCreateMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Archive className="h-4 w-4 text-gray-500" />
                      <span>From Activity Bank</span>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Search + Refresh + Filter + Sort bar matching vue_class_activities.png */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>

            <label className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 shadow-sm">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <select
                aria-label="Filter activities"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="all">Filter: All</option>
                <option value="quiz">Quizzes</option>
                <option value="assignment">Assignments</option>
                <option value="material">Materials</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort</span>
            </button>
          </div>
        </div>

        {/* List / Empty State */}
        {activeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-gray-900">No activities yet</p>
            <p className="mt-1 max-w-md text-xs text-gray-500">
              Create your first activity to get your students started. Assignments, quizzes, and
              materials will appear here.
            </p>
            {isTeacher ? (
              <Link
                href={`/class/view/${classId}/activities/create/quiz`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Activity</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {activeList.map((item) => (
              <ActivityRow
                key={item.id}
                classId={classId}
                item={item}
                role={role}
                onToggleDelete={toggleDeleteActivity}
              />
            ))}
          </div>
        )}
      </div>
    </ClassWorkspaceTemplate>
  );
}
