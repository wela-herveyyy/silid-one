"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClassCardItem } from "@/types/lms";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) {
    return `rgba(249, 115, 22, ${alpha})`;
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ClassCardProps {
  item: ClassCardItem;
  designTheme?: "modern" | "playful";
  onToggleArchive?: (id: string) => void;
}

export function ClassCard({
  item,
  designTheme = "modern",
  onToggleArchive,
}: ClassCardProps) {
  const themeColor = item.accentColor || "#f97316";
  const [infoOpen, setInfoOpen] = useState(false);

  if (designTheme === "playful") {
    return (
      <article
        className="cls-card group relative flex aspect-[5/4] min-h-[180px] w-full flex-col overflow-hidden rounded-[24px] border-2 p-5 text-left transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-1"
        style={
          {
            borderColor: hexToRgba(themeColor, 0.35),
            background: `linear-gradient(145deg, ${hexToRgba(themeColor, 0.18)} 0%, #ffffff 50%, ${hexToRgba(themeColor, 0.1)} 100%)`,
            "--cls-color": themeColor,
          } as React.CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-2xl"
          style={{ backgroundColor: hexToRgba(themeColor, 0.06) }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full"
          style={{
            background: `radial-gradient(circle at 65% 30%, ${hexToRgba(themeColor, 0.12)}, ${hexToRgba(themeColor, 0.04)})`,
          }}
          aria-hidden="true"
        />

        <Link
          href={`/class/view/${encodeURIComponent(item.id)}`}
          className="absolute inset-0 z-[1] focus:outline-none"
          aria-label={`Open ${item.subjectName}`}
        />

        <div className="pointer-events-none relative z-[2] flex items-start justify-between gap-3">
          <span
            className="cls-icon inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-all duration-300 group-hover:-rotate-6"
            style={{ backgroundColor: themeColor }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
              />
            </svg>
          </span>

          <span
            className="inline-flex max-w-[60%] items-center truncate rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm"
            style={{
              color: themeColor,
              boxShadow: `inset 0 0 0 1px ${hexToRgba(themeColor, 0.35)}`,
            }}
          >
            {item.subjectCode}
          </span>
        </div>

        <div className="min-h-6 flex-1" aria-hidden="true" />

        <div className="relative z-[2]">
          <span
            className="pointer-events-none text-[10px] font-extrabold uppercase tracking-[0.18em]"
            style={{ color: themeColor }}
          >
            Class
          </span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <h3 className="pointer-events-none line-clamp-2 min-w-0 flex-1 pr-1 text-[17px] font-extrabold leading-tight text-gray-900">
              {item.subjectName}
            </h3>
            <span
              className="cls-arrow pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200"
              style={{
                backgroundColor: hexToRgba(themeColor, 0.12),
                color: themeColor,
              }}
            >
              <svg
                className="cls-arrow-icon h-4 w-4 transition-transform duration-200"
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
          <p className="pointer-events-none mt-1.5 line-clamp-1 text-xs font-semibold text-gray-700">
            {item.sectionName}
          </p>
          <p className="pointer-events-none mt-1 line-clamp-1 text-xs font-medium text-gray-600">
            Teacher: {item.teacherName}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className="class-card group relative min-h-[250px] aspect-[4/5] w-full overflow-hidden border text-left shadow-md transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-offset-2"
      style={
        {
          backgroundColor: themeColor,
          borderColor: `${themeColor}70`,
          "--card-color": themeColor,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.75)} 0%, ${themeColor} 50%, ${hexToRgba(themeColor, 0.92)} 100%)`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -right-14 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: hexToRgba(themeColor, 0.28) }}
        />
        <div
          className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: hexToRgba(themeColor, 0.28) }}
        />
        <div
          className="absolute left-[55%] top-[55%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: hexToRgba(themeColor, 0.28) }}
        />
        <div className="absolute left-1/2 top-[22%] h-[8rem] w-[8rem] -translate-x-1/2 -translate-y-2 rounded-full bg-white/25 blur-2xl" />

        <div className="absolute left-1/2 top-[22%] flex h-[4.75rem] w-[4.75rem] -translate-x-1/2 items-center justify-center rounded-2xl border border-white/55 bg-white/25 text-white shadow-[0_12px_32px_-8px_rgba(244,63,94,0.55)] ring-1 ring-white/30 backdrop-blur-md">
          <svg
            className="h-10 w-10 drop-shadow-[0_2px_6px_rgba(124,45,18,0.45)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent"
        aria-hidden="true"
      />

      <Link
        href={`/class/view/${encodeURIComponent(item.id)}`}
        className="absolute inset-0 z-[1] focus:outline-none"
        aria-label={`Open ${item.subjectName}`}
      />

      <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col justify-end p-5">
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-2xl">
            {item.subjectName}
          </h3>
          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wide text-white/90">
            {item.sectionName}
          </p>
          <p className="line-clamp-1 text-xs font-medium text-white/85">
            Teacher: {item.teacherName}
          </p>
          <div className="h-px w-full bg-white/40" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="inline-flex max-w-[55%] items-center truncate rounded-md bg-white/15 px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wide text-white backdrop-blur-sm">
              {item.subjectCode}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white sm:text-xs">
              Open
              <svg
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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

      <div className="absolute right-3 top-3 z-[3] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setInfoOpen((prev) => !prev)}
          className="class-card-action"
          aria-label={`Class info: ${item.subjectName}`}
          title="Class details"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <Link
          href={`/class/view/${item.id}/members`}
          className="class-card-action"
          aria-label={`Class participants: ${item.subjectName}`}
          title="Participants & roster"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>

        <Link
          href={`/class/edit/${item.id}`}
          className="class-card-action"
          aria-label={`Edit class: ${item.subjectName}`}
          title="Edit class card"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z"
            />
          </svg>
        </Link>
        {onToggleArchive ? (
          <button
            type="button"
            onClick={() => onToggleArchive(item.id)}
            className="class-card-action"
            aria-label={
              item.archived ? `Restore ${item.subjectName}` : `Archive ${item.subjectName}`
            }
            title={item.archived ? "Restore class" : "Archive class"}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0H4m16 0l-1.5-3h-13L4 7m6 4h4"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {infoOpen ? (
        <div
          className="animate-dropdown-enter absolute inset-x-3 top-14 z-10 rounded-xl border border-white/30 bg-white/95 p-3 text-xs text-gray-800 shadow-lg backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-bold text-gray-900">{item.subjectName}</p>
          <p className="mt-1 text-gray-600">{item.sectionName} · {item.schoolYear}</p>
          <p className="text-gray-500">{item.schedule} · {item.studentCount} students</p>
        </div>
      ) : null}
    </article>
  );
}
