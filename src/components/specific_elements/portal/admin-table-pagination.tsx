"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "lib/utils";
import { ADMIN_TABLE_PAGE_SIZE_OPTIONS } from "hooks/use-admin-table-pagination";

const selectClass =
  "rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-800 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const btnClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40";

type Props = {
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  rangeFrom: number;
  rangeTo: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
};

export default function AdminTablePagination({
  totalCount,
  page,
  totalPages,
  pageSize,
  rangeFrom,
  rangeTo,
  onPageChange,
  onPageSizeChange,
  className,
}: Props) {
  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-zinc-600">
        <span className="tabular-nums">
          {rangeFrom}–{rangeTo}
        </span>
        <span className="text-zinc-400"> · </span>
        <span className="text-zinc-500">{totalCount} total</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="whitespace-nowrap">Rows</span>
          <select
            className={selectClass}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {ADMIN_TABLE_PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={btnClass}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[5.5rem] px-1 text-center text-xs tabular-nums text-zinc-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className={btnClass}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
