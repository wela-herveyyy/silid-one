"use client";

import { ArrowRight, Calendar, Download, Search, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { AttendanceEntry } from "@/types/lms";

const STATUSES: Array<{ value: AttendanceEntry["status"]; label: string }> = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

export default function ClassAttendancePage() {
  const { classId } = useParams<{ classId: string }>();
  const { attendance, members, setAttendanceStatus, role } = useLmsSession();
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("2026-11-17");

  const teachers = members.filter((m) => m.role === "Teacher");
  const emailFor = (studentName: string) =>
    members.find((m) => m.name === studentName)?.email ??
    `${studentName.toLowerCase().replace(/\s+/g, ".")}@wela.ph`;

  const filteredAttendance = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attendance;
    return attendance.filter((a) => {
      const em =
        members.find((m) => m.name === a.studentName)?.email ??
        `${a.studentName.toLowerCase().replace(/\s+/g, ".")}@wela.ph`;
      return a.studentName.toLowerCase().includes(q) || em.toLowerCase().includes(q);
    });
  }, [attendance, members, search]);

  const canEdit = role === "Teacher" || role === "Admin";

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Students / Teachers Pill Tabs matching vue_class_attendance.png */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "students"
                ? "rounded-t-md bg-blue-500 text-white"
                : "rounded-t-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Students
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teachers")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "teachers"
                ? "rounded-t-md bg-blue-500 text-white"
                : "rounded-t-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Teachers
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-center text-xl font-bold uppercase tracking-wide text-gray-900">
            ATTENDANCE
          </h2>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">
                {activeTab === "students" ? "Students Information" : "Teachers Information"}
              </p>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "students" ? "Search student email" : "Search teacher email"
                  }
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-100 pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">Timestamp</p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Timestamp"
                  className="bg-transparent text-xs font-mono text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <Download className="h-4 w-4" />
              <span>Export All</span>
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
            {activeTab === "students" ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-500">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-right">Status ({date})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((row) => (
                    <tr key={row.studentId} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={row.studentName} size="sm" />
                          <span>{row.studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {emailFor(row.studentName)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          {STATUSES.map((opt) => {
                            const active = row.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setAttendanceStatus(row.studentId, opt.value)}
                                className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                                  active
                                    ? opt.value === "absent"
                                      ? "bg-red-100 text-red-700"
                                      : opt.value === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="divide-y divide-gray-100">
                {teachers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.email}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                      <Users className="h-3 w-3" />
                      Present
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              Daily attendance records <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
