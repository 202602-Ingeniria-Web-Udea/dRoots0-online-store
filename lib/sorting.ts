export type SortOrder = "newest" | "oldest";
export type SortDirection = "asc" | "desc";

/** Reads the date order from `?order=`. Defaults to newest first. */
export function readSortOrder(
  value: string | string[] | undefined,
): SortOrder {
  return value === "oldest" ? "oldest" : "newest";
}

export function sortDirection(order: SortOrder): SortDirection {
  return order === "oldest" ? "asc" : "desc";
}

export function toggleSortOrder(order: SortOrder): SortOrder {
  return order === "newest" ? "oldest" : "newest";
}
