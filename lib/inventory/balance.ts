import { Decimal } from "decimal.js";
import { DEFAULT_TIME_ZONE } from "./time-zone";

export type MovementType = "INCOMING" | "OUTGOING";

/** Anything that stringifies to a decimal: string, number, bigint, Prisma.Decimal. */
export type DecimalLike = string | number | bigint | { toString(): string };

export interface BalanceMovement {
  type: MovementType;
  quantity: DecimalLike;
}

/** Converts a value to Decimal, rejecting NaN / Infinity / malformed input. */
export function toDecimal(value: DecimalLike, label = "value"): Decimal {
  if (value === null || value === undefined) {
    throw new RangeError(`${label} is required`);
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number`);
  }
  let decimal: Decimal;
  try {
    decimal = new Decimal(value.toString());
  } catch {
    throw new RangeError(`${label} is not a valid decimal number`);
  }
  if (!decimal.isFinite()) {
    throw new RangeError(`${label} must be a finite number`);
  }
  return decimal;
}

/** Applies one movement to a running balance. INCOMING adds, OUTGOING subtracts. */
export function applyMovement(
  balance: Decimal,
  movement: BalanceMovement,
): Decimal {
  const quantity = toDecimal(movement.quantity, "quantity");
  if (quantity.isNegative()) {
    throw new RangeError("quantity must not be negative");
  }
  switch (movement.type) {
    case "INCOMING":
      return balance.plus(quantity);
    case "OUTGOING":
      return balance.minus(quantity);
    default:
      throw new RangeError(`Unknown movement type: ${String(movement.type)}`);
  }
}

/**
 * currentBalance = initialBalance + sum(INCOMING) - sum(OUTGOING)
 * The initial balance is NOT a movement, so it is counted exactly once.
 */
export function computeCurrentBalance(
  initialBalance: DecimalLike,
  movements: ReadonlyArray<BalanceMovement>,
): Decimal {
  let balance = toDecimal(initialBalance, "initialBalance");
  for (const movement of movements) {
    balance = applyMovement(balance, movement);
  }
  return balance;
}

// === Daily balance series (task 4.4) ===

export interface TimedMovement extends BalanceMovement {
  /** When the movement happened (the `occurredAt` column). */
  occurredAt: Date;
}

export interface DailyBalance {
  /** Calendar day in the configured time zone, YYYY-MM-DD. */
  date: string;
  /** End-of-day balance as a plain decimal string (no exponent notation). */
  balance: string;
}

export interface DailyBalanceOptions {
  /** IANA time zone used to group movements by day. */
  timeZone?: string;
  /** Extend the series (repeating the last balance) up to this instant's day. */
  until?: Date;
}

/** YYYY-MM-DD for the given instant in the given IANA time zone. */
export function toDayKey(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid date");
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function nextDayKey(key: string): string {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Starts from the initial balance, applies movements chronologically and
 * returns one end-of-day balance per calendar day between the first movement
 * day and the last one (or `until`). Days without movements repeat the
 * previous balance. Returns [] when there are no movements.
 */
export function buildDailyBalances(
  initialBalance: DecimalLike,
  movements: ReadonlyArray<TimedMovement>,
  options: DailyBalanceOptions = {},
): DailyBalance[] {
  if (movements.length === 0) return [];

  const timeZone = options.timeZone ?? DEFAULT_TIME_ZONE;
  const initial = toDecimal(initialBalance, "initialBalance");
  const sorted = [...movements].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );

  let running = initial;
  const endOfDay = new Map<string, Decimal>();
  for (const movement of sorted) {
    running = applyMovement(running, movement);
    endOfDay.set(toDayKey(movement.occurredAt, timeZone), running);
  }

  const keys = [...endOfDay.keys()];
  const first = keys[0];
  let last = keys[keys.length - 1];
  if (options.until) {
    const untilKey = toDayKey(options.until, timeZone);
    if (untilKey > last) last = untilKey;
  }

  const series: DailyBalance[] = [];
  let carry = initial;
  for (let day = first; day <= last; day = nextDayKey(day)) {
    const value = endOfDay.get(day);
    if (value) carry = value;
    series.push({ date: day, balance: carry.toFixed() });
  }
  return series;
}