"use client";

import { Layout, X, Zap } from "lucide-react";

interface ThemeSidebarProps {
  open: boolean;
  onClose: () => void;
  designTheme: "modern" | "playful";
  onDesignThemeChange: (theme: "modern" | "playful") => void;
}

export function ThemeSidebar({
  open,
  onClose,
  designTheme,
  onDesignThemeChange,
}: ThemeSidebarProps) {
  if (!open) return null;

  const cardDesignOptions: Array<{
    id: "playful" | "modern";
    label: string;
    Icon: typeof Zap;
  }> = [
    { id: "playful", label: "Simple", Icon: Zap },
    { id: "modern", label: "Modern", Icon: Layout },
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-[3px] transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className="animate-panel-enter fixed bottom-0 right-0 top-0 z-[101] flex w-full max-w-[22rem] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[-12px_0_40px_-12px_rgba(15,23,42,0.12)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-sidebar-title"
      >
        <header className="shrink-0 bg-white px-6 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h2
                id="theme-sidebar-title"
                className="text-[22px] font-bold leading-none tracking-tight text-slate-900"
              >
                Appearance
              </h2>
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
            <button
              type="button"
              onClick={onClose}
              aria-label="Close theme panel"
              className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <section aria-labelledby="course-cards-heading">
            <h3 id="course-cards-heading" className="text-[13px] font-medium text-slate-800">
              Course cards style:
            </h3>

            <div
              className="mt-3 grid w-full grid-cols-2 gap-2.5"
              role="radiogroup"
              aria-labelledby="course-cards-heading"
            >
              {cardDesignOptions.map((opt) => {
                const Icon = opt.Icon;
                const active = designTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onDesignThemeChange(opt.id)}
                    className={`group relative flex h-16 min-h-0 flex-col items-center justify-center gap-1 rounded-lg bg-white py-1.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                      active ? "ring-2 ring-orange-500" : "ring-1 ring-slate-200 hover:ring-slate-300"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-orange-600" : "text-slate-500"}`} />
                    <span
                      className={`text-[11px] font-medium leading-none ${
                        active ? "text-orange-700" : "text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
