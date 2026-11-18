import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#c2410c] text-white border border-transparent hover:bg-[#9a3412] active:scale-[0.99]",
    secondary:
      "bg-[#f4f4f5] text-[#171717] border border-[rgba(17,24,39,0.08)] hover:bg-[#e4e4e7] active:scale-[0.99]",
    ghost:
      "bg-transparent text-[#525252] border border-transparent hover:bg-[#f4f4f5] hover:text-[#171717]",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-9 px-4 text-sm rounded-lg",
    lg: "h-11 px-5 text-sm rounded-lg",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
