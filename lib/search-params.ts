const MAX_SEARCH_LENGTH = 100;

/**
 * Normalizes the `q` query parameter. Repeated parameters and non-string
 * values fall back to an empty search instead of throwing.
 */
export function readSearchTerm(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_SEARCH_LENGTH);
}
