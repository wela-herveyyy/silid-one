"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/atoms/Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        hasLeadingIcon
        hasTrailingAction={Boolean(value)}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#737373] transition-colors hover:bg-[#f4f4f5] hover:text-[#171717]"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      ) : null}
    </div>
  );
}
