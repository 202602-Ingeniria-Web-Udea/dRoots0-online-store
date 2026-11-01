import { z } from "zod";

// Matches the @db.Decimal(14, 3) columns: up to 11 integer digits, 3 decimals.
const DECIMAL = /^\d{1,11}(\.\d{1,3})?$/;

export const createMasterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 characters")
    .max(100, "Name must have at most 100 characters"),
  initialBalance: z
    .string()
    .trim()
    .regex(DECIMAL, "Enter a valid non-negative number (up to 3 decimals)"),
});

export type CreateMasterInput = z.infer<typeof createMasterSchema>;


// ---- movements ----

const ZERO = /^0+(\.0+)?$/;

export const createMovementSchema = z.object({
  masterId: z.string().trim().min(1, "Select an inventory master").max(64),
  type: z.enum(["INCOMING", "OUTGOING"], { error: "Select a movement type" }),
  quantity: z
    .string()
    .trim()
    .regex(DECIMAL, "Enter a valid positive number (up to 3 decimals)")
    .refine((value) => !ZERO.test(value), "Quantity must be greater than zero"),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;