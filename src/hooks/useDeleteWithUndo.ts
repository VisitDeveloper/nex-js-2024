"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeleteUndoSeconds } from "lib/delete-undo-seconds";

type Options<T> = {
  onExecuteDelete: (item: T) => Promise<void>;
  /** Override env seconds (e.g. for tests). */
  undoSeconds?: number;
};

/**
 * Custom confirm dialog + delayed delete with undo (countdown from env).
 */
export function useDeleteWithUndo<T>({ onExecuteDelete, undoSeconds }: Options<T>) {
  const secondsDefault = undoSeconds ?? getDeleteUndoSeconds();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<T | null>(null);
  const [tick, setTick] = useState(0);

  const itemRef = useRef<T | null>(null);
  const deadlineRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onExecuteRef = useRef(onExecuteDelete);
  onExecuteRef.current = onExecuteDelete;

  const clearScheduledDelete = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const undo = useCallback(() => {
    clearScheduledDelete();
    setToastOpen(false);
    itemRef.current = null;
    setPendingItem(null);
  }, [clearScheduledDelete]);

  const openConfirm = useCallback(
    (item: T) => {
      clearScheduledDelete();
      setToastOpen(false);
      itemRef.current = item;
      setPendingItem(item);
      setDialogOpen(true);
    },
    [clearScheduledDelete]
  );

  const closeDialogOnly = useCallback(() => {
    setDialogOpen(false);
    if (!toastOpen) {
      itemRef.current = null;
      setPendingItem(null);
    }
  }, [toastOpen]);

  const confirmDelete = useCallback(() => {
    const item = itemRef.current;
    if (!item) return;
    setDialogOpen(false);
    const secs = secondsDefault;
    deadlineRef.current = Date.now() + secs * 1000;
    setToastOpen(true);
    setTick((t) => t + 1);

    clearScheduledDelete();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setToastOpen(false);
      const target = itemRef.current;
      itemRef.current = null;
      setPendingItem(null);
      if (target) {
        void onExecuteRef.current(target);
      }
    }, secs * 1000);
  }, [clearScheduledDelete, secondsDefault]);

  useEffect(() => {
    if (!toastOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [toastOpen]);

  const secondsLeft = toastOpen
    ? Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
    : 0;

  const onDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) setDialogOpen(true);
      else closeDialogOnly();
    },
    [closeDialogOnly]
  );

  return {
    dialogOpen,
    onDialogOpenChange,
    pendingItem,
    openConfirm,
    closeDialog: closeDialogOnly,
    confirmDelete,
    undo,
    toastOpen,
    secondsLeft,
  };
}
