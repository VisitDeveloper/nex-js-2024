"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Eye, ExternalLink } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import type { AccountTutorialListRow } from "lib/account-portal-types";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

export default function AccountTutorialsListClient({
  signedIn,
  rows,
}: {
  signedIn: boolean;
  rows: AccountTutorialListRow[];
}) {
  const [selected, setSelected] = useState<AccountTutorialListRow | null>(null);
  const tutorialsPag = useAdminTablePagination(rows, [rows.length]);

  if (!signedIn) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-600">
          Sign in to see learning content for products you have purchased.
        </p>
        <Link className="text-sm font-medium text-emerald-700 underline" href="/auth">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <AdminRightDrawer
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.title ?? "Tutorial"}
        description={
          selected
            ? "Unlocked from a qualifying purchase. Open the full tutorial when you are ready."
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4 text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">Product: </span>
              {selected.title}
            </p>
            <p className="font-mono text-xs text-zinc-500">{selected.slug}</p>
            <Link
              href={`/account/tutorials/${encodeURIComponent(selected.slug)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Open full tutorial
              <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
            </Link>
          </div>
        ) : null}
      </AdminRightDrawer>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <BookOpen className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Your tutorials</h2>
          <span className="text-xs text-zinc-500">{tutorialsPag.totalCount} available</span>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3" scope="col">
                  Product
                </th>
                <th className="px-4 py-3" scope="col">
                  Slug
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-zinc-500">
                    No tutorials yet. Purchases unlock content here.
                  </td>
                </tr>
              ) : (
                tutorialsPag.pageItems.map((item) => (
                  <tr
                    key={item.slug}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">{item.title}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-zinc-600">
                      {item.slug}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Preview"
                          onClick={() => setSelected(item)}
                          className={iconBtn}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/account/tutorials/${encodeURIComponent(item.slug)}`}
                          className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          totalCount={tutorialsPag.totalCount}
          page={tutorialsPag.page}
          totalPages={tutorialsPag.totalPages}
          pageSize={tutorialsPag.pageSize}
          rangeFrom={tutorialsPag.rangeFrom}
          rangeTo={tutorialsPag.rangeTo}
          onPageChange={tutorialsPag.setPage}
          onPageSizeChange={tutorialsPag.setPageSize}
        />
      </div>
    </div>
  );
}
