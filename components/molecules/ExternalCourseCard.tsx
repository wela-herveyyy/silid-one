"use client";

import Link from "next/link";
import type { ExternalCourseItem } from "@/types/lms";

interface ExternalCourseCardProps {
  course: ExternalCourseItem;
  designTheme?: "modern" | "playful";
}

export function ExternalCourseCard({
  course,
  designTheme = "modern",
}: ExternalCourseCardProps) {
  const categoryLabel = (course.gradeLabel || course.topicTags[0] || "Reference").toUpperCase();

  if (designTheme === "playful") {
    return (
      <Link
        href={`/courses/${course.id}`}
        className="ext-card group relative flex aspect-[5/4] min-h-[180px] w-full flex-col overflow-hidden rounded-[24px] border-2 border-blue-200 bg-gradient-to-br from-[#f0f6ff] to-[#f6faff] p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        aria-label={`Open external course: ${course.title}`}
      >
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-300/30 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-200/60 to-sky-200/50"
          aria-hidden="true"
        />

        <div className="relative z-[2] flex items-start justify-between gap-3">
          <span className="ext-icon inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white transition-all duration-300 group-hover:-rotate-6">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5l-2 5-5 2 2-5z" />
            </svg>
          </span>

          <span className="inline-flex max-w-[60%] items-center truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 ring-1 ring-blue-200 backdrop-blur-sm">
            {categoryLabel}
          </span>
        </div>

        <div className="relative z-[2] mt-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
            Reference
          </span>
          <h3 className="mt-1 line-clamp-2 text-[17px] font-extrabold leading-tight text-gray-900">
            {course.title}
          </h3>
        </div>

        <div className="relative z-[2] mt-3 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-gray-600">
            <svg
              className="h-4 w-4 shrink-0 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.057 0 2.074.157 3 .459V19c-.926.302-1.943.459-3 .459-2.062 0-4.065-.867-6-2.292m0-14.25v14.25"
              />
            </svg>
            <span className="truncate">Reference link</span>
          </span>
          <span className="ext-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100/70 text-blue-500 transition-all duration-200">
            <svg
              className="ext-arrow-icon h-4 w-4 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/courses/${course.id}`}
      className="external-course-card group relative min-h-[250px] aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[1.25rem] border border-white/15 bg-violet-700 text-left shadow-md transition-all duration-300 hover:border-white/30 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      aria-label={`Open external course: ${course.title}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-700 bg-cover bg-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:blur-md group-focus-visible:scale-105 group-focus-visible:blur-md" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden transition-all duration-500 ease-out group-hover:blur-md group-focus-visible:blur-md"
        aria-hidden="true"
      >
        <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-cyan-300/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-pink-500/55 blur-3xl" />
        <div className="absolute left-[55%] top-[55%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/45 blur-3xl" />
        <div className="absolute left-1/2 top-[22%] h-[8rem] w-[8rem] -translate-x-1/2 -translate-y-2 rounded-full bg-white/25 blur-2xl" />

        <div className="absolute left-1/2 top-[22%] flex h-[4.75rem] w-[4.75rem] -translate-x-1/2 items-center justify-center rounded-2xl border border-white/55 bg-white/25 text-white shadow-[0_12px_32px_-8px_rgba(79,61,161,0.65)] ring-1 ring-white/30 backdrop-blur-md">
          <svg
            className="h-10 w-10 drop-shadow-[0_2px_6px_rgba(37,25,89,0.6)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.057 0 2.074.157 3 .459V19c-.926.302-1.943.459-3 .459-2.062 0-4.065-.867-6-2.292m0-14.25v14.25" />
          </svg>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet-900/85 via-violet-800/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2] flex flex-col bg-violet-900/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        <p className="shrink-0 pt-9 text-center text-[11px] font-bold uppercase tracking-[0.26em] text-white drop-shadow-md sm:text-xs sm:tracking-[0.28em]">
          Click to view
        </p>
        <div className="flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 pt-4">
          <p className="max-h-full overflow-y-auto text-center text-sm font-medium leading-relaxed text-white drop-shadow-md sm:text-base">
            {course.description}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs">
            {categoryLabel}
          </p>
          <h3 className="line-clamp-2 text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-2xl">
            {course.title}
          </h3>
          <div className="h-px w-full bg-white/40" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-white/95 sm:text-[11px]">
              External
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white sm:text-xs">
              Explore
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
