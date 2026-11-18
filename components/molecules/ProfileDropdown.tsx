"use client";

import { ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/lib/domain/actions/auth.actions";
import type { UserRole } from "@/types/lms";

interface ProfileDropdownProps {
  userName: string;
  schoolName: string;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  designTheme: "modern" | "playful";
  onDesignThemeChange: (theme: "modern" | "playful") => void;
  onOpenAppearance?: () => void;
  onOpenApps?: () => void;
}

export function ProfileDropdown({
  userName,
  schoolName,
  role,
  onOpenAppearance,
  onOpenApps,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Profile menu"
        className="inline-flex items-center justify-center gap-0.5 rounded-md px-0 py-0 text-base font-medium leading-none text-gray-700 transition-colors duration-150 hover:text-orange-500/90 lg:items-baseline lg:py-2.5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden">
          <User className="h-6 w-6" />
        </span>
        <span className="hidden items-baseline gap-0.5 whitespace-nowrap lg:inline-flex">
          Profile
          <ChevronDown
            className={`h-4 w-4 shrink-0 translate-y-px self-center text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-dropdown-enter absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/[0.04]"
        >
          {/* User Identity Row matching live_04_profile.png */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white">
              {initials || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
              <p className="truncate text-xs text-gray-500">
                {role}
                {schoolName ? ` · ${schoolName}` : ""}
              </p>
            </div>
          </div>

          <div className="py-1.5 text-sm">
            {onOpenAppearance ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenAppearance();
                }}
                className="flex w-full items-center px-4 py-2 text-left font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                Theme
              </button>
            ) : null}

            {onOpenApps ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenApps();
                }}
                className="flex w-full items-center px-4 py-2 text-left font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                Apps
              </button>
            ) : null}

            <span className="flex w-full cursor-not-allowed items-center px-4 py-2 font-medium text-gray-300">
              Language
            </span>

            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              Settings
            </Link>

            <span className="flex w-full cursor-not-allowed items-center px-4 py-2 font-medium text-gray-300">
              Help
            </span>

            <div className="my-1 h-px bg-gray-100" />

            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center px-4 py-2 text-left font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
