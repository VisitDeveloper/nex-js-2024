"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "components/pure-elements/drawer";
import { cn } from "lib/utils";

type AdminRightDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Wider panels for long forms (e.g. products, blog). */
  size?: "default" | "wide";
};

export default function AdminRightDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "default",
}: AdminRightDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent
        className={cn(
          "fixed inset-y-0 right-0 left-auto z-50 mt-0 flex h-full max-h-none w-full flex-col rounded-none border-l border-zinc-200 bg-white p-0 shadow-xl outline-none",
          size === "wide"
            ? "max-w-[min(100vw,42rem)] sm:max-w-[min(100vw,48rem)]"
            : "max-w-md sm:max-w-lg"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="min-w-0 pr-2">
            <DrawerTitle className="text-left text-base font-semibold leading-snug text-zinc-900">
              {title}
            </DrawerTitle>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
            ) : null}
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </DrawerClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
