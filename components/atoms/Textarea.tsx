import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-[rgba(17,24,39,0.12)] bg-white p-3 text-sm text-[#171717] placeholder:text-[#737373] transition-colors duration-150 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${className}`}
      {...props}
    />
  );
}
