interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-medium text-[#737373]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-[#171717] tabular-nums">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-[#525252]">{detail}</p> : null}
    </div>
  );
}
