interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "accent" | "positive" | "neutral";
}

export function ProgressBar({
  value,
  max = 100,
  tone = "accent",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  const fill =
    tone === "positive"
      ? "bg-[#16a34a]"
      : tone === "neutral"
        ? "bg-[#525252]"
        : "bg-[#ea580c]";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f4f4f5]">
      <div
        className={`h-full rounded-full transition-[width] duration-200 ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
