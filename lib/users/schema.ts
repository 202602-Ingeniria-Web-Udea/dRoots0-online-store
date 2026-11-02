import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 characters")
    .max(100, "Name must have at most 100 characters"),
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password must be at most 200 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
