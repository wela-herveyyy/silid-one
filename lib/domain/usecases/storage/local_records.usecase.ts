import {
  IDB_DB_NAME,
  IDB_STORE_NAME,
  type LocalRecord,
  type StorageResult,
} from "@/lib/entities/storage.type";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalRecord(record: LocalRecord): Promise<StorageResult<LocalRecord>> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      tx.objectStore(IDB_STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return { ok: true, data: record };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to save record." };
  }
}

export async function listLocalRecords(): Promise<StorageResult<LocalRecord[]>> {
  try {
    const db = await openDb();
    const items = await new Promise<LocalRecord[]>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const req = tx.objectStore(IDB_STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as LocalRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    return { ok: true, data: items };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to list records." };
  }
}

export async function deleteLocalRecord(id: string): Promise<StorageResult> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      tx.objectStore(IDB_STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete record.",
    };
  }
}
