export const PAGE_SIZE = 10;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type PageItem = number | "ellipsis";

/** Reads `?page=` and falls back to page 1 for missing or invalid values. */
export function readPage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

/**
 * Builds a page descriptor. Requested pages above the last page are clamped to
 * the last page so an out-of-range URL still renders useful content.
 */
export function buildPagination(
  total: number,
  requestedPage: number,
  pageSize = PAGE_SIZE,
): Pagination {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const safeTotal = Math.max(0, Math.trunc(total));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const requested = Number.isFinite(requestedPage)
    ? Math.trunc(requestedPage)
    : 1;
  const page = Math.min(Math.max(1, requested), totalPages);

  return { page, pageSize: safePageSize, total: safeTotal, totalPages };
}

/**
 * Returns a compact set of page numbers, using ellipses when there are more
 * than seven pages.
 */
export function getVisiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("ellipsis");
  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}
