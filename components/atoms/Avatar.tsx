interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-11 w-11 text-sm"
        : "h-10 w-10 text-xs";

  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 select-none ${sizeClass} ${className}`}
    >
      {initials || "U"}
    </span>
  );
}
