"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { validateRoleChange } from "@/lib/users/role-policy";

const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  role: z.enum(["ADMIN", "USER"]),
});

export type UpdateUserRoleResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateUserRole(
  input: unknown
): Promise<UpdateUserRoleResult> {
  const actor = await requireAdmin();

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid role change request." };
  }

  const { userId, role } = parsed.data;
  const policyError = validateRoleChange({ actorId: actor.id, targetId: userId });
  if (policyError) {
    return { ok: false, error: policyError };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) {
      return { ok: false, error: "User not found." };
    }

    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { ok: false, error: "Unable to update the role. Please try again." };
  }
}
