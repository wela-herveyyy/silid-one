"use client";

import { Bell, BellOff, Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NotificationItem } from "@/types/lms";

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationDropdown({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className={`inline-flex items-center justify-center gap-0.5 rounded-md px-0 py-0 text-base font-medium leading-none transition-all duration-150 no-underline lg:items-baseline lg:py-2.5 ${
          open ? "text-orange-700" : "text-gray-700 hover:text-orange-500/90"
        }`}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden">
          <Bell className="h-6 w-6" strokeWidth={1.75} />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white"
            />
          ) : null}
        </span>
        <span className="relative hidden pr-0.5 lg:inline-block">
          Notifications
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white"
            />
          ) : null}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 translate-y-px self-center text-gray-400 transition-transform duration-200 lg:inline-block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="animate-dropdown-enter absolute right-0 top-full z-50 mt-2 w-[23rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
                  {unreadCount}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-xs font-medium text-orange-600 transition-colors hover:text-orange-700"
                >
                  Mark all as read
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <BellOff className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400">
                  We&apos;ll let you know when something arrives.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onMarkRead(notification.id)}
                    className={`group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-150 ${
                      !notification.isRead
                        ? "bg-orange-50/60 hover:bg-orange-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="mt-[5px] shrink-0">
                      {!notification.isRead ? (
                        <span className="flex h-2 w-2 rounded-full bg-orange-500" />
                      ) : (
                        <span className="flex h-2 w-2" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`line-clamp-1 text-sm leading-snug ${
                          !notification.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {notification.body}
                      </p>
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        {notification.createdAtLabel}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                        }}
                        aria-label={`Mark '${notification.title}' as read`}
                        className="shrink-0 rounded-md p-1.5 text-gray-300 opacity-0 transition-all duration-150 hover:bg-orange-100 hover:text-orange-600 group-hover:opacity-100"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
