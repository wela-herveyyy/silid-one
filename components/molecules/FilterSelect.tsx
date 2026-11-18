"use client";

import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: FilterSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-10 w-full appearance-none rounded-lg border border-[rgba(17,24,39,0.12)] bg-white pl-3 pr-8 text-sm text-[#171717] transition-colors duration-150 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]"
        aria-hidden="true"
      />
    </div>
  );
}
