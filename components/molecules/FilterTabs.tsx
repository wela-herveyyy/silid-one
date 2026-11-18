"use client";

export interface FilterTabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  options: FilterTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[rgba(17,24,39,0.08)] bg-[#f4f4f5] p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] ${
              active
                ? "bg-white text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                : "text-[#525252] hover:text-[#171717]"
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined ? (
              <span className="font-mono text-xs text-[#737373] tabular-nums">
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
