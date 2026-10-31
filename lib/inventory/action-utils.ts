import type { ZodError } from "zod";

/** Keeps the first message of each field so forms can show one error per input. */
export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

/** Prisma P2002: unique constraint violation (e.g. duplicated master name). */
export const isUniqueViolation = (error: unknown) => errorCode(error) === "P2002";