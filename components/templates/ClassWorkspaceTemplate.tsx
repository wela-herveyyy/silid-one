"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ClassTabNav } from "@/components/molecules/ClassTabNav";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

interface ClassWorkspaceTemplateProps {
  classId: string;
  children: ReactNode;
}

export function ClassWorkspaceTemplate({
  classId,
  children,
}: ClassWorkspaceTemplateProps) {
  const { classes, role } = useLmsSession();
  const decodedId = (() => {
    try {
      return decodeURIComponent(classId);
    } catch {
      return classId;
    }
  })();

  const classItem = classes.find((c) => c.id === classId || c.id === decodedId) ??
    classes[0] ?? {
      id: decodedId,
      subjectName: decodedId,
      subjectCode: decodedId,
      sectionName: "",
      schoolYear: "",
      teacherName: "",
      schedule: "Active",
      studentCount: 0,
      kind: "sms" as const,
      accentColor: "#ea580c",
    };

  return (
    <DashboardTemplate>
      <div className="space-y-6">
        {/* Top Navigation Row (matches ClassSocials.vue) */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/class"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back to Classes</span>
          </Link>

          <ClassTabNav classId={encodeURIComponent(classItem.id)} role={role} />
        </div>

        {/* Hero ClassInfo Banner (matches ClassInfo.vue 1:1) */}
        <div className="cls-info relative overflow-hidden border-y-2 border-orange-200 bg-gradient-to-br from-[#fff7f0] to-[#fffaf5] px-5 py-10 shadow-sm -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full sm:rounded-[24px] sm:border-2 sm:px-12 sm:py-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-52 w-52 rounded-full bg-gradient-to-br from-orange-200/45 to-rose-200/35"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-16 -bottom-10 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-[1] flex items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-[1.5rem] font-black leading-tight tracking-tight text-gray-900 sm:text-[2.5rem] lg:text-[3rem]">
                {classItem.subjectName}
              </h1>

              {classItem.sectionName ? (
                <p className="mt-1.5 text-sm font-semibold uppercase tracking-[0.15em] text-orange-500">
                  {classItem.sectionName}
                </p>
              ) : null}

              {classItem.teacherName ? (
                <p className="mt-1 text-sm font-medium text-gray-600">
                  Teacher: {classItem.teacherName}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-widest text-white">
                  {classItem.subjectCode || "—"}
                </span>

                <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                  Class
                </span>

                {classItem.schoolYear ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                    <svg
                      className="h-3 w-3 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                    SY {classItem.schoolYear}
                  </span>
                ) : null}

                <span className="inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 tabular-nums">
                  {classItem.schedule} · {classItem.studentCount} students
                </span>
              </div>
            </div>

            {/* Tilted orange graduation-cap icon card (matches ClassInfo.vue right emblem) */}
            <div className="hidden shrink-0 sm:flex items-center justify-center">
              <div
                className="flex h-28 w-28 rotate-6 items-center justify-center rounded-[24px] shadow-lg transition-transform duration-300 hover:rotate-0"
                style={{ backgroundColor: classItem.accentColor || "#ea580c" }}
              >
                <svg
                  className="h-14 w-14 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </DashboardTemplate>
  );
}
