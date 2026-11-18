import {
  getStorageEstimate as getStorageEstimateUseCase,
  requestPersistentStorage as requestPersistentStorageUseCase,
} from "@/lib/domain/usecases/storage/get_storage_estimate.usecase";
import {
  deleteLocalRecord as deleteLocalRecordUseCase,
  listLocalRecords as listLocalRecordsUseCase,
  saveLocalRecord as saveLocalRecordUseCase,
} from "@/lib/domain/usecases/storage/local_records.usecase";
import type { LocalRecord, StorageEstimate, StorageResult } from "@/lib/entities/storage.type";

export async function getStorageEstimate(): Promise<StorageResult<StorageEstimate>> {
  return getStorageEstimateUseCase();
}

export async function requestPersistentStorage(): Promise<StorageResult<boolean>> {
  return requestPersistentStorageUseCase();
}

export async function saveLocalRecord(record: LocalRecord): Promise<StorageResult<LocalRecord>> {
  return saveLocalRecordUseCase(record);
}

export async function listLocalRecords(): Promise<StorageResult<LocalRecord[]>> {
  return listLocalRecordsUseCase();
}

export async function deleteLocalRecord(id: string): Promise<StorageResult> {
  return deleteLocalRecordUseCase(id);
}
