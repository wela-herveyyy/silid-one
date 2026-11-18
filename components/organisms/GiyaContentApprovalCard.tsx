"use client";

import { CheckSquare } from "lucide-react";
import type { ChatMessageItem } from "@/types/lms";

interface GiyaContentApprovalCardProps {
  card: NonNullable<ChatMessageItem["approvalCard"]>;
  onApprove: () => void;
  onReject: () => void;
}

export function GiyaContentApprovalCard({
  card,
  onApprove,
  onReject,
}: GiyaContentApprovalCardProps) {
  const rows: Array<[string, string]> = [
    ["Title", card.title],
    ...(card.topic ? [["Topic", card.topic] as [string, string]] : []),
    ...(card.termName ? [["Term", card.termName] as [string, string]] : []),
    ...(card.categoryName ? [["Category", card.categoryName] as [string, string]] : []),
    ["Publish", card.publishedDate],
    ["Deadline", card.deadline ?? "No deadline"],
    ...(card.questionCount ? [["Questions", `${card.questionCount} items`] as [string, string]] : []),
  ];

  const isResolved = card.status !== "pending";

  return (
    <section
      className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm"
      aria-label="Content approval"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">
            Review {card.toolName} before creation
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Silid will create exactly this content only after you approve it.
          </p>
        </div>
        {isResolved ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              card.status === "approved"
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {card.status === "approved" ? "Approved" : "Cancelled"}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-2 rounded-xl bg-white p-3 text-sm">
        {rows.map(([name, value]) => (
          <div key={name} className="grid grid-cols-[7rem_1fr] gap-2">
            <dt className="font-semibold text-slate-500">{name}</dt>
            <dd className="break-words text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      <details className="mt-3 rounded-xl border border-orange-100 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Review exact content payload
        </summary>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
          {JSON.stringify(card, null, 2)}
        </pre>
      </details>

      {card.status === "pending" ? (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onReject}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Approve and create
          </button>
        </div>
      ) : null}
    </section>
  );
}
