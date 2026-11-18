"use client";

import { Award, List, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

const INITIAL_BADGES = [
  { id: "b-1", name: "Consistent Reader", criteria: "Completed 5 reading reflections on time", awarded: 18 },
  { id: "b-2", name: "Perfect Quiz Streak", criteria: "Scored 90% or higher across 3 quizzes", awarded: 9 },
  { id: "b-3", name: "Peer Helper", criteria: "Answered 3 classmate questions cleanly", awarded: 6 },
];

export default function ClassBadgesPage() {
  const { classId } = useParams<{ classId: string }>();
  const { role } = useLmsSession();
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [tab, setTab] = useState<"badges" | "logs">("badges");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState("");

  const isTeacher = role === "Teacher" || role === "Admin";

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBadges((prev) => [
      {
        id: `b-${Date.now()}`,
        name: name.trim(),
        criteria: criteria.trim() || "Class participation award",
        awarded: 0,
      },
      ...prev,
    ]);
    setName("");
    setCriteria("");
    setAdding(false);
  };

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        {/* Header matching vue_class_badges.png */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Class Achievements
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Badges
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create, send and manage badges for this class.
            </p>
          </div>

          {isTeacher ? (
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Badge</span>
            </button>
          ) : null}
        </div>

        {/* Underline Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab("badges")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === "badges"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Badges</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("logs")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === "logs"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <List className="h-4 w-4" />
              <span>Badge Logs</span>
            </button>
          </div>
        </div>

        {adding ? (
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-orange-200 bg-orange-50/40 p-5 sm:grid-cols-3 sm:items-end"
          >
            <div>
              <label htmlFor="badge-name" className="block text-xs font-semibold text-gray-700">
                Badge Name
              </label>
              <input
                id="badge-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fast Finisher"
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="badge-criteria" className="block text-xs font-semibold text-gray-700">
                Criteria
              </label>
              <input
                id="badge-criteria"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Award criteria..."
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="h-9 flex-1 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {tab === "badges" ? (
          badges.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Award className="h-6 w-6" />
              </span>
              <p className="text-sm font-bold text-gray-900">No badges yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Create your first badge to recognize students for outstanding work.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Award className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-orange-600 tabular-nums">
                      {badge.awarded} awarded
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-gray-900">{badge.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{badge.criteria}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {badges.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="font-semibold text-gray-800">{b.name}</span>
                  <span className="text-xs text-gray-500">{b.awarded} students rewarded</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClassWorkspaceTemplate>
  );
}
