"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteLocalRecordAction,
  getStorageEstimateAction,
  listLocalRecordsAction,
  requestPersistentStorageAction,
  saveLocalRecordAction,
} from "@/lib/domain/actions/storage.actions";
import type { LocalRecord, StorageEstimate } from "@/lib/entities/storage.type";

export function useStoragePanel() {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [records, setRecords] = useState<LocalRecord[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  const refresh = useCallback(async () => {
    const [estRes, listRes] = await Promise.all([
      getStorageEstimateAction(),
      listLocalRecordsAction(),
    ]);
    if (estRes.ok) setEstimate(estRes.data);
    if (listRes.ok) setRecords(listRes.data);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [refresh]);

  const handlePersist = async () => {
    const res = await requestPersistentStorageAction();
    setStatus(res.ok ? (res.data ? "Persistent storage granted" : "Browser declined persist") : res.error);
    await refresh();
  };

  const handleSaveRecord = async () => {
    if (!title.trim()) return;
    const res = await saveLocalRecordAction({
      id: `rec-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });
    if (res.ok) {
      setTitle("");
      setNotes("");
      setStatus("Saved to IndexedDB (rnd_pwa)");
      await refresh();
    } else {
      setStatus(res.error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteLocalRecordAction(id);
    await refresh();
  };

  return {
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
  };
}
