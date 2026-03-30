"use client";

import { cn } from "lib/utils";

type Props = {
  open: boolean;
  message: string;
  secondsLeft: number;
  onUndo: () => void;
  undoLabel?: string;
};

export default function PendingDeleteUndoToast({
  open,
  message,
  secondsLeft,
  onUndo,
  undoLabel = "Undo",
}: Props) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-[202] w-[min(calc(100vw-2rem),480px)] -translate-x-1/2",
        "rounded-2xl border border-zinc-200 bg-zinc-900 px-4 py-3 text-white shadow-lg",
        "flex flex-wrap items-center justify-between gap-3"
      )}
      role="status"
      aria-live="polite"
    >
      <p className="min-w-0 flex-1 text-sm leading-snug text-zinc-100">{message}</p>
      <div className="flex shrink-0 items-center gap-2">
        <span className="tabular-nums text-xs font-semibold text-zinc-400">{secondsLeft}s</span>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
        >
          {undoLabel}
        </button>
      </div>
    </div>
  );
}
