"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  busy = false,
  title = "Sign out?",
  description = "You will need to sign in again to access your account.",
  confirmLabel = "Sign out",
  cancelLabel = "Cancel",
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[201] w-[min(calc(100vw-2rem),420px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl",
            "focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          onPointerDownOutside={(e) => busy && e.preventDefault()}
          onEscapeKeyDown={(e) => busy && e.preventDefault()}
        >
          <Dialog.Title className="text-lg font-bold text-zinc-900">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-zinc-600 leading-relaxed">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={busy}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="rounded-xl border border-[#FEA439]/40 bg-[#FEA439]/15 px-4 py-2 text-sm font-semibold text-[#8A4F08] hover:bg-[#FEA439]/25 disabled:opacity-50"
            >
              {busy ? "Signing out…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
