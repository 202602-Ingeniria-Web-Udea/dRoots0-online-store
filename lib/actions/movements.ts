"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import {
  fieldErrorsFromZod,
  isSerializationFailure,
} from "@/lib/inventory/action-utils";
import { computeCurrentBalance, toDecimal } from "@/lib/inventory/balance";
import { createMovementSchema } from "@/lib/inventory/schemas";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action";

/** Expected business errors; their message is safe to show to the user. */
class MovementError extends Error {
  constructor(
    message: string,
    readonly field?: "quantity" | "masterId",
  ) {
    super(message);
  }
}

const MAX_RETRIES = 3;

/** Serializable transaction, retried when Postgres reports a write conflict. */
async function runSerializable<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, { isolationLevel: "Serializable" });
    } catch (error) {
      if (isSerializationFailure(error) && attempt < MAX_RETRIES) continue;
      throw error;
    }
  }
}

export async function createMovement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  // 1) Authentication (outside try/catch so redirects propagate)
  const user = await requireUser();

  // 2) Validation: type and quantity (> 0, finite, well-formed)
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
    const created = await runSerializable(async (tx) => {
      // 3) The master must exist
      const master = await tx.inventoryMaster.findUnique({
        where: { id: masterId },
        select: { initialBalance: true },
      });
      if (!master) {
        throw new MovementError("Inventory master not found.", "masterId");
      }

      // 4) An outgoing movement can never make the balance negative
      if (type === "OUTGOING") {
        const movements = await tx.inventoryMovement.findMany({
          where: { masterId },
          select: { type: true, quantity: true },
        });
        const balance = computeCurrentBalance(master.initialBalance, movements);
        if (balance.minus(toDecimal(quantity)).isNegative()) {
          throw new MovementError(
            "Insufficient balance: this outgoing movement would make the balance negative.",
            "quantity",
          );
        }
      }

      // 5) responsibleId comes from the session, never from the client
      return tx.inventoryMovement.create({
        data: { masterId, type, quantity, responsibleId: user.id },
        select: { id: true },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/masters");
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    if (error instanceof MovementError) {
      return {
        ok: false,
        error: error.message,
        fieldErrors: error.field ? { [error.field]: error.message } : undefined,
      };
    }
    console.error("createMovement failed", error); // server log only
    return {
      ok: false,
      error: "Could not register the movement. Please try again.",
    };
  }
}