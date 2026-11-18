import {
  deleteLocalRecord,
  getStorageEstimate,
  listLocalRecords,
  requestPersistentStorage,
  saveLocalRecord,
} from "@/lib/domain/services/storage.service";
import type { LocalRecord, StorageEstimate, StorageResult } from "@/lib/entities/storage.type";

export async function getStorageEstimateAction(): Promise<StorageResult<StorageEstimate>> {
  return getStorageEstimate();
}

export async function requestPersistentStorageAction(): Promise<StorageResult<boolean>> {
  return requestPersistentStorage();
}

export async function saveLocalRecordAction(
  record: LocalRecord,
): Promise<StorageResult<LocalRecord>> {
  return saveLocalRecord(record);
}

export async function listLocalRecordsAction(): Promise<StorageResult<LocalRecord[]>> {
  return listLocalRecords();
}

export async function deleteLocalRecordAction(id: string): Promise<StorageResult> {
  return deleteLocalRecord(id);
}
