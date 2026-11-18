"use client";

import { Layout, Zap } from "lucide-react";
import { useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { UserRole } from "@/types/lms";

export default function SettingsPage() {
  const { user, role, setRole, designTheme, setDesignTheme } = useLmsSession();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const cardDesignOptions: Array<{
    id: "playful" | "modern";
    label: string;
    Icon: typeof Zap;
  }> = [
    { id: "playful", label: "Simple", Icon: Zap },
    { id: "modern", label: "Modern", Icon: Layout },
  ];

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
            Preferences
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account.</p>
        </div>

        {/* Silid v2 Restore card matching live_20_settings.png */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
            Migration and restore legacy Silid v2 activities
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Silid v2 Restore</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Select legacy Firebase classes and activities to restore into your v3 class cards.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-4 py-8 text-center">
            <p className="text-xs font-medium text-gray-500">
              No Silid v2 classes found for your account.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Profile</h2>
              <p className="text-xs text-gray-500">{user.schoolName}</p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">
              {role}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-name" className="block text-xs font-semibold text-gray-600">
                Display name
              </label>
              <input
                id="set-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label htmlFor="set-email" className="block text-xs font-semibold text-gray-600">
                Email
              </label>
              <input
                id="set-email"
                value={user.email}
                readOnly
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {saved ? (
              <span className="text-xs font-semibold text-green-600">Preferences saved</span>
            ) : null}
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="inline-flex h-10 items-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Save changes
            </button>
          </div>
        </section>

        {/* Appearance Card Theme (matches ThemeSidebar.vue) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Appearance</h2>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 shrink-0 text-orange-500"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth={1.7}
              />
              <path
                d="M19 9v3a2 2 0 0 1-2 2h-5a2 2 0 0 0-2 2v4"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
              />
              <rect x="8.5" y="20" width="3" height="2.5" rx="0.6" fill="currentColor" />
            </svg>
          </div>
          <p className="mt-1 text-sm text-gray-500">Course cards style:</p>

          <div
            className="mt-3 grid w-full max-w-xs grid-cols-2 gap-2.5"
            role="radiogroup"
            aria-label="Course cards style"
          >
            {cardDesignOptions.map((opt) => {
              const Icon = opt.Icon;
              const selected = designTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDesignTheme(opt.id)}
                  className={`group relative flex h-16 min-h-0 flex-col items-center justify-center gap-1 rounded-lg bg-white py-1.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                    selected ? "ring-2 ring-orange-500" : "ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? "text-orange-600" : "text-slate-500"}`} />
                  <span
                    className={`text-[11px] font-medium leading-none ${
                      selected ? "text-orange-700" : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Active preview role</h2>
          <p className="mt-1 text-sm text-gray-500">
            Switch roles to preview student, teacher, admin, and partner navigation.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["Teacher", "Student", "Admin", "Partner"] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition-all duration-200 ${
                  role === item
                    ? "bg-orange-500 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>
    </DashboardTemplate>
  );
}
