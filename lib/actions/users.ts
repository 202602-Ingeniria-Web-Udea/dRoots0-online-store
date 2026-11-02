"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  fieldErrorsFromZod,
  isUniqueViolation,
} from "@/lib/inventory/action-utils";
import type { ActionResult } from "@/lib/types/action";
import { createUserSchema } from "@/lib/users/schema";
import { validateRoleChange } from "@/lib/users/role-policy";

const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1).max(64),
  role: z.enum(["ADMIN", "USER"]),
});

export async function createUser(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { name, email, role, password } = parsed.data;

  try {
    const passwordHash = await hash(password, 12);

    const created = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        role,
        password: passwordHash,
        profile: {
          create: {
            image:
              role === "ADMIN" ? "/avatars/admin.svg" : "/avatars/user.svg",
            address: "",
            phone: "",
          },
        },
      },
      select: { id: true },
    });

    revalidatePath("/users");
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "A user with this email already exists.",
        fieldErrors: { email: "A user with this email already exists." },
      };
    }

    console.error("createUser failed", error);
    return {
      ok: false,
      error: "Could not create the user. Please try again.",
    };
  }
}

export async function updateUserRole(input: unknown): Promise<ActionResult> {
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
