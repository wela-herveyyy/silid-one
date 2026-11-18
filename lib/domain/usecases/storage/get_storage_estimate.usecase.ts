import type { StorageEstimate, StorageResult } from "@/lib/entities/storage.type";

export async function getStorageEstimate(): Promise<StorageResult<StorageEstimate>> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      return { ok: false, error: "Storage API not available." };
    }
    const est = await navigator.storage.estimate();
    const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
    return {
      ok: true,
      data: {
        quota: est.quota ?? 0,
        usage: est.usage ?? 0,
        persisted,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to read storage estimate.",
    };
  }
}

export async function requestPersistentStorage(): Promise<StorageResult<boolean>> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) {
      return { ok: false, error: "Storage persistence API not supported." };
    }
    const granted = await navigator.storage.persist();
    return { ok: true, data: granted };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to request persistent storage.",
    };
  }
}
