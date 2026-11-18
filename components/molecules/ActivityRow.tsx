"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ClassActivityItem, UserRole } from "@/types/lms";

interface ActivityRowProps {
  classId: string;
  item: ClassActivityItem;
  role: UserRole;
  onToggleDelete?: (id: string) => void;
}

export function ActivityRow({ classId, item, role, onToggleDelete }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isTeacher = role === "Teacher" || role === "Admin";
  const base = `/class/view/${classId}/activities`;

  const primaryHref =
    item.type === "material"
      ? `${base}/material/view/${item.id}`
      : isTeacher
        ? `${base}/grading/${item.id}`
        : item.type === "quiz"
          ? `${base}/quiz/answer/${item.id}`
          : `${base}/assignment/answer/${item.id}`;

  const primaryLabel =
    item.type === "material"
      ? "Open Material"
      : isTeacher
        ? "Check Submissions"
        : item.type === "quiz"
          ? "Answer Quiz"
          : "Submit Work";

  const pillCls =
    item.type === "quiz"
      ? "bg-purple-50 text-purple-600 border-purple-200"
      : item.type === "assignment"
        ? "bg-blue-50 text-blue-600 border-blue-200"
        : "bg-pink-50 text-pink-600 border-pink-200";

  return (
    <div
      className={`overflow-visible rounded-2xl border bg-white transition-all duration-200 ${
        expanded ? "border-orange-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Collapsed Accordion Header matching live_10_class_activities.png */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
              expanded ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-gray-900">{item.title}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pillCls}`}
              >
                {item.type}
              </span>
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Published {item.publishedDate.replace("T", " ")}
              </span>
              {!item.noDeadline && item.deadline ? (
                <span>Due {item.deadline.replace("T", " ")}</span>
              ) : null}
            </p>
          </div>
        </button>

        {/* Right ... Context Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Activity actions"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div className="animate-dropdown-enter absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
              <Link
                href={primaryHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{primaryLabel}</span>
              </Link>
              {isTeacher ? (
                <Link
                  href={`${base}/edit/${item.type}/${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Activity</span>
                </Link>
              ) : null}
              {isTeacher && onToggleDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleDelete(item.id);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{item.deleted ? "Restore" : "Delete"}</span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Expanded Body matching live_24_activity_expanded.png 1:1 */}
      {expanded ? (
        <div className="border-t border-orange-100 bg-orange-50/20 px-5 py-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-9">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Instructions
                </p>
                <p className="mt-1.5 border-l-2 border-orange-300 pl-3 text-sm text-gray-700">
                  {item.description}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Statistics
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                    <p className="text-lg font-extrabold text-gray-900">{item.totalStudents}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Students
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                    <p className="text-lg font-extrabold text-purple-600">{item.submittedCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Started
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                    <p className="text-lg font-extrabold text-blue-600">{item.submittedCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Submitted
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                    <p className="text-lg font-extrabold text-green-600">
                      {Math.max(0, item.submittedCount - 2)}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Graded
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 lg:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Actions
              </p>
              <Link
                href={primaryHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{primaryLabel}</span>
              </Link>
              {isTeacher && item.type !== "material" ? (
                <Link
                  href={`${base}/score-report/${item.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Score Report
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
