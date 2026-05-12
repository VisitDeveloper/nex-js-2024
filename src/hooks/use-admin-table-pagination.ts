import { useCallback, useEffect, useMemo, useState } from "react";

export const ADMIN_TABLE_PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;
export const DEFAULT_ADMIN_TABLE_PAGE_SIZE = 15;

export function paginateSlice<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const ps = Math.max(1, pageSize);
  const p = Math.max(1, page);
  const start = (p - 1) * ps;
  return items.slice(start, start + ps) as T[];
}

/**
 * Client-side pagination for admin data tables. Pass `resetDeps` so the page resets when
 * filters or source lists change (e.g. search query, Strapi refetch).
 */
export function useAdminTablePagination<T>(items: readonly T[], resetDeps: readonly unknown[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_ADMIN_TABLE_PAGE_SIZE);

  const resetKey = JSON.stringify(resetDeps);
  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalCount = items.length;
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  const pageItems = useMemo(
    () => paginateSlice(items, safePage, pageSize),
    [items, safePage, pageSize]
  );

  const rangeFrom = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeTo = totalCount === 0 ? 0 : Math.min(safePage * pageSize, totalCount);

  const setPageSizeAndReset = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    pageItems,
    totalCount,
    totalPages,
    rangeFrom,
    rangeTo,
  };
}
