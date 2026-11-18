"use client";

import { Database, HardDrive, Plus, Trash2 } from "lucide-react";
import { useStoragePanel } from "@/components/organisms/storagePanel.hooks";
import { formatBytes } from "@/lib/entities/storage.type";

export function StoragePanel({ embedded = false }: { embedded?: boolean }) {
  const {
    estimate,
    records,
    title,
    setTitle,
    notes,
    setNotes,
    status,
    handlePersist,
    handleSaveRecord,
    handleDeleteRecord,
  } = useStoragePanel();

  const usedPct =
    estimate && estimate.quota > 0
      ? Math.min(100, Math.round((estimate.usage / estimate.quota) * 100))
      : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <HardDrive className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Local Storage &amp; IndexedDB</h2>
            <p className="text-xs text-gray-500">Storage API quota &amp; `rnd_pwa` offline cache</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            estimate?.persisted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              estimate?.persisted ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {estimate?.persisted ? "Persisted" : "Best-effort"}
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Used: {formatBytes(estimate?.usage ?? 0)}</span>
          <span>Quota: {formatBytes(estimate?.quota ?? 0)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePersist}
            className="inline-flex h-8 items-center rounded-lg border border-orange-200 bg-white px-3 text-xs font-semibold text-orange-600 hover:bg-orange-50"
          >
            Request Persistence
          </button>
          {status ? <span className="text-xs font-medium text-gray-500">{status}</span> : null}
        </div>
      </div>

      <div className={embedded ? "space-y-4" : "grid grid-cols-1 gap-4 lg:grid-cols-2"}>
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Save Record</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Record title..."
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-500 focus:outline-none"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes..."
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveRecord}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-4 text-xs font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Save to IndexedDB
          </button>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Database className="h-3.5 w-3.5" />
            Records ({records.length})
          </p>
          {records.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 py-5 text-center text-xs text-gray-400">
              No local records yet.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{rec.title}</p>
                    {rec.notes ? <p className="text-gray-500">{rec.notes}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete local record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
