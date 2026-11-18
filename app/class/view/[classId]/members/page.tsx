"use client";

import { ArrowUpDown, Calendar, ChevronDown, Filter, Plus, Search, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import { syncClassRosterFromFrappeAction } from "@/lib/domain/actions/lms_session.actions";
import type { ClassMemberItem } from "@/types/lms";

export default function ClassMembersPage() {
  const { classId } = useParams<{ classId: string }>();
  const { members, toggleMemberEnabled, toggleMemberPermit, removeMember, role, frappeMeta } =
    useLmsSession();
  const [liveRoster, setLiveRoster] = useState<ClassMemberItem[] | null>(null);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewRole, setViewRole] = useState<"Student" | "Teacher">("Student");

  const decodedClassId = useMemo(() => {
    try {
      return decodeURIComponent(classId);
    } catch {
      return classId;
    }
  }, [classId]);

  useEffect(() => {
    if (!frappeMeta.connected) return;
    let active = true;
    void syncClassRosterFromFrappeAction(decodedClassId).then((res) => {
      if (active && res.ok) {
        setLiveRoster(res.data.members);
      }
    });
    return () => {
      active = false;
    };
  }, [decodedClassId, frappeMeta.connected]);

  const activeMembers = liveRoster ?? members;
  const isTeacher = role === "Teacher" || role === "Admin";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = activeMembers.filter(
      (m) =>
        m.role === viewRole &&
        (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
    );
    return sortAsc
      ? [...list].sort((a, b) => a.name.localeCompare(b.name))
      : [...list].sort((a, b) => b.name.localeCompare(a.name));
  }, [activeMembers, viewRole, search, sortAsc]);

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        {/* Header matching live_14_class_members.png */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
            Class Roster
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Participants
          </h2>
          <p className="mt-1 text-sm text-gray-500">View and manage everyone in this class.</p>
        </div>

        {/* Underline Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <span className="inline-flex items-center gap-2 border-b-2 border-orange-500 pb-3 text-sm font-semibold text-orange-600">
              <User className="h-4 w-4" />
              <span>Participants</span>
            </span>
            <Link
              href={`/class/view/${classId}/attendance`}
              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-3 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
            >
              <Calendar className="h-4 w-4" />
              <span>Attendance</span>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar matching live_14_class_members.png */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-900">
            {viewRole}s <span className="font-normal text-gray-400">· {filtered.length}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-52 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${viewRole.toLowerCase()}s...`}
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortAsc((p) => !p)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
              <span>Last Name · {sortAsc ? "A to Z" : "Z to A"}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewRole((r) => (r === "Student" ? "Teacher" : "Student"))}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              <span>{viewRole}s</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Participant Rows with ENABLED & PERMIT Toggles (matches live_14_class_members.png) */}
        <div className="space-y-3">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{member.name}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        member.gender === "FEMALE"
                          ? "bg-pink-50 text-pink-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {member.gender ?? "STUDENT"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>

              {isTeacher ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Enabled
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={member.enabled ?? true}
                      aria-label={`Toggle enabled for ${member.name}`}
                      onClick={() => toggleMemberEnabled(member.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        member.enabled ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          member.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Permit
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={member.permit ?? true}
                      aria-label={`Toggle permit for ${member.name}`}
                      onClick={() => toggleMemberPermit(member.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        member.permit ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          member.permit ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    aria-label={`Remove ${member.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
              <Filter className="mx-auto mb-2 h-5 w-5" />
              No {viewRole.toLowerCase()}s match your search.
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Plus className="h-3.5 w-3.5" />
            Synced from Wela School Management System
          </span>
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
