"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  fieldErrorsFromZod,
  isUniqueViolation,
} from "@/lib/inventory/action-utils";
import { createMasterSchema } from "@/lib/inventory/schemas";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action";

export async function createMaster(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  // Outside try/catch on purpose: redirects thrown by the guard must propagate.
  const admin = await requireAdmin();

  const parsed = createMasterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const created = await prisma.inventoryMaster.create({
      data: {
        name: parsed.data.name,
        initialBalance: parsed.data.initialBalance,
        createdById: admin.id, // always from the session, never from the client
      },
      select: { id: true },
    });
    revalidatePath("/masters");
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "A master with this name already exists.",
        fieldErrors: { name: "A master with this name already exists." },
      };
    }
    console.error("createMaster failed", error);
    return { ok: false, error: "Could not create the master. Please try again." };
  }
}