"use client";

import {
  Award,
  Bookmark,
  Calendar,
  Copy,
  Folder,
  Globe,
  HelpCircle,
  Layers,
  Lock,
  Plus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

type BankTab = "activities" | "section-questions" | "questions" | "shared";

export default function ActivityBankPage() {
  const { activities, addActivity, classes } = useLmsSession();
  const [tab, setTab] = useState<BankTab>("questions");
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [publicIds, setPublicIds] = useState<Record<string, boolean>>({});

  const items = activities.filter(
    (a) =>
      a.type !== "material" &&
      (!appliedSearch.trim() ||
        a.title.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        a.topic.toLowerCase().includes(appliedSearch.toLowerCase())),
  );

  const targetClassId = classes[0]?.id ?? "cls-1";

  const tabs: Array<{ id: BankTab; label: string; Icon: typeof Folder }> = [
    { id: "activities", label: "Activities", Icon: Folder },
    { id: "section-questions", label: "Section Questions", Icon: Layers },
    { id: "questions", label: "Questions", Icon: HelpCircle },
    { id: "shared", label: "Shared with you", Icon: Share2 },
  ];

  return (
    <DashboardTemplate>
      <div className="space-y-6">
        {/* Header matching ActivityBankView.vue / vue_activity_bank.png 1:1 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Library
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Activity Bank
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Build, organize, and share educational content. Copy questions, sections, and
              activities to your bank for reuse across classes.
            </p>
          </div>
          <Link
            href="/activity-bank/create-quiz"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </Link>
        </div>

        {/* Underline Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-6">
            {tabs.map((item) => {
              const Icon = item.Icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    active
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* White Rounded Filter Card matching vue_activity_bank.png */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Search title / description
              </label>
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search..."
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Owner</label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All owners</option>
                <option value="me">Created by me</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Created from</label>
              <input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Created to</label>
              <input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAppliedSearch(searchDraft)}
              className="inline-flex h-10 items-center rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchDraft("");
                setAppliedSearch("");
                setOwner("all");
                setCreatedFrom("");
                setCreatedTo("");
              }}
              className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content List or Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <HelpCircle className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-gray-900">No items yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Start your activity bank by creating your first item.
            </p>
            <Link
              href="/activity-bank/create-quiz"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Question</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isPublic = Boolean(publicIds[item.id]);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
                        <HelpCircle className="h-3 w-3" />
                        <span>{item.type === "assignment" ? "Attach File" : "Quiz"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-orange-600">
                        <Bookmark className="h-3 w-3" />
                        <span>Bank</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${
                          isPublic ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      >
                        {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        <span>{isPublic ? "Public" : "Private"}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPublicIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Globe className="h-3.5 w-3.5 text-gray-500" />
                        <span>{isPublic ? "Make Private" : "Make Public"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addActivity({
                            classId: targetClassId,
                            type: item.type,
                            title: `${item.title} (Copy)`,
                            topic: item.topic,
                            termName: "1st Term",
                            categoryName: item.type === "quiz" ? "Quiz" : "Assignment",
                            publishedDate: "2026-11-17T08:00",
                            deadline: "2027-11-17T08:00",
                            noDeadline: false,
                            points: item.points,
                            description: item.description,
                            questions: item.questions,
                          });
                          setCopiedId(item.id);
                        }}
                        title="Use in class"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>{copiedId === item.id ? "Copied to class" : "Use in class"}</span>
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-3 text-sm font-bold text-gray-900">
                    {item.type === "assignment" ? "Assignment: " : "Quiz: "}
                    {item.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{item.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Nov 13, 2026</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" />
                      <span>{item.points} points</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Copy className="h-3 w-3" />
                      <span>{item.topic}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardTemplate>
  );
}
