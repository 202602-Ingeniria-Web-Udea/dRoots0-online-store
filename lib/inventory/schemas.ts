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