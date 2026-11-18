import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasLeadingIcon?: boolean;
  hasTrailingAction?: boolean;
}

export function Input({
  hasLeadingIcon = false,
  hasTrailingAction = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-[rgba(17,24,39,0.12)] bg-white text-sm text-[#171717] placeholder:text-[#737373] transition-colors duration-150 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${
        hasLeadingIcon ? "pl-9" : "pl-3"
      } ${hasTrailingAction ? "pr-9" : "pr-3"} ${className}`}
      {...props}
    />
  );
}
