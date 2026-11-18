"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserRole } from "@/types/lms";

interface ClassTabNavProps {
  classId: string;
  role: UserRole;
  variant?: "horizontal" | "sidebar";
}

interface DropdownItem {
  label: string;
  to: string;
  iconPath: string;
  teacherOnly?: boolean;
}

export function ClassTabNav({
  classId,
  role,
  variant = "horizontal",
}: ClassTabNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebar = variant === "sidebar";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(target)) {
        setMobileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSocialsActive = pathname === `/class/view/${classId}`;
  const isActivitiesActive =
    pathname.startsWith(`/class/view/${classId}/activities`) &&
    !pathname.includes("/deleted-activities");

  const allDropdownItems: DropdownItem[] = [
    {
      label: "Participants",
      to: `/class/view/${classId}/members`,
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      label: "Attendance",
      to: `/class/view/${classId}/attendance`,
      iconPath:
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Classwork Components",
      to: `/class/view/${classId}/components`,
      teacherOnly: true,
      iconPath:
        "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      label: "Grades",
      to: `/class/view/${classId}/grade-book`,
      teacherOnly: true,
      iconPath:
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "Badges",
      to: `/class/view/${classId}/badges`,
      iconPath:
        "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    },
    {
      label: "Class Chat",
      to: `/class/view/${classId}/chat`,
      iconPath:
        "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    },
    {
      label: "Deleted Activities",
      to: `/class/view/${classId}/activities/deleted-activities`,
      teacherOnly: true,
      iconPath:
        "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    },
  ];

  const classDropdownItems =
    role === "Student"
      ? allDropdownItems.filter((item) => !item.teacherOnly)
      : allDropdownItems;

  const isClassActive = classDropdownItems.some((item) => pathname.startsWith(item.to));
  const anyActive = isSocialsActive || isActivitiesActive || isClassActive;

  function tabClass(active: boolean): string {
    const base = isSidebar
      ? "inline-flex w-full items-center justify-start gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-200"
      : "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm";
    if (active) {
      return `${base} border-orange-500 bg-orange-50 text-orange-600`;
    }
    return `${base} border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600`;
  }

  function navigateTo(to: string) {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    router.push(to);
  }

  return (
    <nav className={`relative z-10 ${isSidebar ? "w-full" : "shrink-0"}`} aria-label="Class navigation">
      {!isSidebar ? (
        <div ref={mobileDropdownRef} className="relative sm:hidden">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
              anyActive
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
            }`}
            onClick={() => setMobileDropdownOpen((prev) => !prev)}
            aria-expanded={mobileDropdownOpen}
            aria-haspopup="true"
          >
            <span>Navigate</span>
            <svg
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                mobileDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileDropdownOpen ? (
            <div
              role="menu"
              className="animate-dropdown-enter absolute right-0 top-full z-[45] mt-2 min-w-[208px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/[0.04]"
            >
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    isSocialsActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                  onClick={() => navigateTo(`/class/view/${classId}`)}
                >
                  <svg
                    className={`h-4 w-4 shrink-0 ${isSocialsActive ? "text-orange-500" : "text-gray-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Socials
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActivitiesActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                  onClick={() => navigateTo(`/class/view/${classId}/activities`)}
                >
                  <svg
                    className={`h-4 w-4 shrink-0 ${isActivitiesActive ? "text-orange-500" : "text-gray-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Activities
                </button>
                <div className="my-1 h-px bg-gray-100" aria-hidden="true" />
                {classDropdownItems.map((item) => {
                  const active = pathname.startsWith(item.to);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className={`flex w-full min-w-0 items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                      }`}
                      onClick={() => navigateTo(item.to)}
                    >
                      <svg
                        className={`h-4 w-4 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                      </svg>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={
          isSidebar
            ? "flex flex-col gap-1.5"
            : "hidden items-center gap-0.5 sm:flex sm:gap-1"
        }
      >
        <Link href={`/class/view/${classId}`} className={tabClass(isSocialsActive)}>
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Socials
        </Link>

        <Link href={`/class/view/${classId}/activities`} className={tabClass(isActivitiesActive)}>
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Activities
        </Link>

        <div ref={dropdownRef} className={`relative ${isSidebar ? "w-full" : ""}`}>
          <button
            type="button"
            className={`${tabClass(isClassActive)} ${isSidebar ? "w-full" : ""}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>Class</span>
            <svg
              className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen ? (
            <div
              role="menu"
              className={`animate-dropdown-enter absolute z-[45] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/[0.04] ${
                isSidebar ? "left-0 right-0 min-w-[208px]" : "right-0 w-[208px]"
              }`}
            >
              <div className="py-1">
                {classDropdownItems.map((item) => {
                  const active = pathname.startsWith(item.to);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className={`flex w-full min-w-0 items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                      }`}
                      onClick={() => navigateTo(item.to)}
                    >
                      <svg
                        className={`h-4 w-4 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                      </svg>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
