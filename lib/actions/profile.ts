"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { profileImageSchema } from "@/lib/profile/schema";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action";

export async function updateProfileImage(
  input: unknown
): Promise<ActionResult<{ image: string }>> {
  const user = await requireUser();

  const parsed = profileImageSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Enter a valid image URL.";
    return { ok: false, error: message, fieldErrors: { image: message } };
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { image: parsed.data.image },
      create: {
        userId: user.id,
        image: parsed.data.image,
        address: "",
        phone: "",
      },
      select: { image: true },
    });

    revalidatePath("/", "layout");
    return { ok: true, data: { image: profile.image } };
  } catch (error) {
    console.error("updateProfileImage failed", error);
    return {
      ok: false,
      error: "Could not update the profile image. Please try again.",
    };
  }
}
