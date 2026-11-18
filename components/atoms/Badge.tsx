import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "neutral" | "accent";
  mono?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  mono = false,
  className = "",
}: BadgeProps) {
  const palette =
    variant === "accent"
      ? "bg-[#fff7ed] text-[#c2410c] border-[#ea580c]/20"
      : "bg-[#f4f4f5] text-[#525252] border-[rgba(17,24,39,0.08)]";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-4 tabular-nums ${
        mono ? "font-mono" : ""
      } ${palette} ${className}`}
    >
      {children}
    </span>
  );
}
