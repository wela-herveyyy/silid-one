export const IDB_DB_NAME = "rnd_pwa";
export const IDB_STORE_NAME = "records";

export type StorageEstimate = {
  quota: number;
  usage: number;
  usageDetails?: Record<string, number>;
  persisted: boolean;
};

export type LocalRecord = {
  id: string;
  title: string;
  notes: string;
  createdAt: string;
};

export type StorageResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / 1024 ** idx;
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}
