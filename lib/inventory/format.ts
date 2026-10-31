import { DEFAULT_TIME_ZONE } from "./time-zone";

/** Presentation only. Never use these values for calculations. */
export function formatQuantity(value: string | number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
    Number(value),
  );
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

export function formatPersonName(user: { name: string; lastName: string | null }): string {
  return [user.name, user.lastName].filter(Boolean).join(" ");
}