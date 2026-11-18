interface SkeletonProps {
  className?: string;
  variant?: "neutral" | "warm";
}

/**
 * Animated loading placeholder matching SilidLMS surface styling.
 */
export function Skeleton({ className = "", variant = "neutral" }: SkeletonProps) {
  const toneClass = variant === "warm" ? "bg-orange-100/80" : "bg-gray-200/80";
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg ${toneClass} ${className}`}
    />
  );
}
