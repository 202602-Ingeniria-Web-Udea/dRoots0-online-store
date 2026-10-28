import { Decimal } from "decimal.js";

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