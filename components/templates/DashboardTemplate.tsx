"use client";

import { GraduationCap, LogOut, School } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { MainNavbar } from "@/components/organisms/MainNavbar";
import { ThemeSidebar } from "@/components/organisms/ThemeSidebar";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export function DashboardTemplate({ children }: { children: ReactNode }) {
  const {
    user,
    role,
    setRole,
    designTheme,
    setDesignTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setGiyaDrawerOpen,
  } = useLmsSession();

  const [themeSidebarOpen, setThemeSidebarOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-white">
      <MainNavbar
        userName={user.name}
        schoolName={user.schoolName}
        role={role}
        onRoleChange={setRole}
        designTheme={designTheme}
        onDesignThemeChange={setDesignTheme}
        onOpenAppearance={() => setThemeSidebarOpen(true)}
        onOpenApps={() => setAppsModalOpen(true)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onOpenGiya={() => setGiyaDrawerOpen(true)}
      />

      <div id="content" className="relative min-h-screen w-full flex-1 overflow-x-clip bg-white py-6">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-300 opacity-25 blur-3xl" />
          <div className="absolute -right-32 top-24 h-[22rem] w-[22rem] rounded-full bg-amber-200 opacity-30 blur-3xl" />
          <div className="absolute -left-20 top-[36rem] h-[20rem] w-[20rem] rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-rose-200 opacity-20 blur-3xl" />
          <div className="absolute -left-32 bottom-[28rem] h-[26rem] w-[26rem] rounded-full bg-emerald-200 opacity-20 blur-3xl" />
          <div className="absolute -right-32 bottom-40 h-[26rem] w-[26rem] rounded-full bg-violet-200 opacity-25 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-[24rem] w-[28rem] rounded-full bg-amber-200 opacity-25 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-[22rem] w-[22rem] rounded-full bg-orange-200 opacity-25 blur-3xl" />
        </div>

        <main className="relative mx-auto w-full max-w-full px-4 md:max-w-[960px] md:px-6 lg:max-w-[1240px] lg:px-6 xl:max-w-[1380px] xl:px-8 2xl:max-w-[min(100%,1640px)]">
          {children}
        </main>
      </div>

      <ThemeSidebar
        open={themeSidebarOpen}
        onClose={() => setThemeSidebarOpen(false)}
        designTheme={designTheme}
        onDesignThemeChange={setDesignTheme}
      />

      {/* Apps Modal matching live_06_apps_modal.png */}
      {appsModalOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
          onClick={() => setAppsModalOpen(false)}
        >
          <div
            className="animate-dropdown-enter w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-gray-700">Select an app to continue</p>

            <div className="mt-7 grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setAppsModalOpen(false)}
                className="group flex flex-col items-center gap-2.5 rounded-xl p-3 transition-colors hover:bg-gray-50"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-red-600 shadow-sm transition-transform group-hover:scale-105">
                  <School className="h-8 w-8" />
                </span>
                <span className="text-xs font-medium text-gray-700">
                  School Management System
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAppsModalOpen(false)}
                className="group flex flex-col items-center gap-2.5 rounded-xl p-3 transition-colors hover:bg-orange-50/60"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 text-orange-500 shadow-sm transition-transform group-hover:scale-105">
                  <GraduationCap className="h-8 w-8" />
                </span>
                <span className="text-xs font-semibold text-gray-900">Silid LMS</span>
              </button>
            </div>

            <Link
              href="/login"
              onClick={() => setAppsModalOpen(false)}
              className="mt-7 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
