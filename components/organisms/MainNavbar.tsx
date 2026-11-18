"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { NotificationDropdown } from "@/components/molecules/NotificationDropdown";
import { ProfileDropdown } from "@/components/molecules/ProfileDropdown";
import type { NotificationItem, UserRole } from "@/types/lms";

interface MainNavbarProps {
  userName: string;
  schoolName: string;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  designTheme: "modern" | "playful";
  onDesignThemeChange: (theme: "modern" | "playful") => void;
  onOpenAppearance?: () => void;
  onOpenApps?: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenGiya: () => void;
}

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  betaBadge?: boolean;
  activeMatch: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Class",
    href: "/class",
    roles: ["Teacher", "Student", "Admin"],
    activeMatch: (p) => p === "/" || p.startsWith("/class"),
  },
  {
    label: "Activity Bank",
    href: "/activity-bank",
    roles: ["Teacher", "Admin"],
    activeMatch: (p) => p.startsWith("/activity-bank"),
  },
  {
    label: "Enrichment",
    href: "/courses",
    roles: ["Teacher", "Student", "Admin", "Partner"],
    activeMatch: (p) => p.startsWith("/courses"),
  },
  {
    label: "Chatbot",
    href: "/chat",
    roles: ["Teacher", "Admin"],
    betaBadge: true,
    activeMatch: (p) => p.startsWith("/chat"),
  },
];

export function MainNavbar({
  userName,
  schoolName,
  role,
  onRoleChange,
  designTheme,
  onDesignThemeChange,
  onOpenAppearance,
  onOpenApps,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenGiya,
}: MainNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) =>
    item.label === "Enrichment" && (role === "Partner" || role === "Admin")
      ? { ...item, href: "/courses/manage" }
      : item,
  );

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-orange-100"
        aria-hidden="true"
      />

      <nav aria-label="Primary navigation">
        <div className="relative mx-auto flex h-16 w-full max-w-full items-center justify-between gap-2 px-4 sm:gap-3 md:max-w-[960px] md:px-6 lg:max-w-[1240px] lg:px-6 xl:max-w-[1380px] xl:px-8 2xl:max-w-[min(100%,1640px)] max-sm:!px-3">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <BrandLogo href={role === "Partner" ? "/courses/manage" : "/class"} />
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-end gap-2 sm:gap-3 lg:gap-4">
            <ul className="hidden min-w-0 items-baseline gap-2 lg:flex lg:gap-3">
              {visibleNav.map((nav) => {
                const active = nav.activeMatch(pathname);
                return (
                  <li key={nav.label}>
                    <Link
                      href={nav.href}
                      className={`group flex items-baseline gap-2 whitespace-nowrap px-3 py-2.5 text-base font-medium leading-none no-underline transition-colors duration-200 ${
                        active ? "text-orange-600" : "text-gray-700 hover:text-orange-500/90"
                      }`}
                    >
                      <span className="relative inline-block">
                        {nav.label}
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 top-full mt-1 h-[5px] w-full origin-left transition-transform duration-300 ease-out ${
                            active
                              ? "scale-x-100 bg-orange-500"
                              : "scale-x-0 bg-orange-400/50 group-hover:scale-x-100"
                          }`}
                        />
                      </span>
                      {nav.betaBadge ? (
                        <span className="inline-flex translate-y-px items-center self-center rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
                          Beta
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <NotificationDropdown
              notifications={notifications}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
            />

            <ProfileDropdown
              userName={userName}
              schoolName={schoolName}
              role={role}
              onRoleChange={onRoleChange}
              designTheme={designTheme}
              onDesignThemeChange={onDesignThemeChange}
              onOpenAppearance={onOpenAppearance}
              onOpenApps={onOpenApps}
            />
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {visibleNav.map((nav) => {
              const active = nav.activeMatch(pathname);
              return (
                <li key={nav.label}>
                  <Link
                    href={nav.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{nav.label}</span>
                    {nav.betaBadge ? (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                        Beta
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
            {role === "Teacher" || role === "Admin" ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenGiya();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <span>Open Giya Assistant</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
