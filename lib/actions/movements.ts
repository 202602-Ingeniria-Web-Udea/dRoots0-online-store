"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { fieldErrorsFromZod } from "@/lib/inventory/action-utils";
import { createMovementSchema } from "@/lib/inventory/schemas";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action";

/**
 * First, simple version (task 4.2). It authenticates, validates and derives the
 * responsible user from the session, but it does NOT yet protect against
 * negative balances or concurrent writes: task 4.3 replaces this file.
 */
export async function createMovement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  // Outside try/catch on purpose: redirects thrown by the guard must propagate.
  const user = await requireUser();

  const parsed = createMovementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const { masterId, type, quantity } = parsed.data;

  try {
    const master = await prisma.inventoryMaster.findUnique({
      where: { id: masterId },
      select: { id: true },
    });
    if (!master) return { ok: false, error: "Inventory master not found." };

    const created = await prisma.inventoryMovement.create({
      data: { masterId, type, quantity, responsibleId: user.id }, // never from the client
      select: { id: true },
    });

    revalidatePath("/transactions");
    revalidatePath("/masters");
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    console.error("createMovement failed", error); // server log only
    return {
      ok: false,
      error: "Could not register the movement. Please try again.",
    };
  }
}