import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Enum_Role } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Enum_Role;
  image: string | null;
};

/**
 * Resolves the authenticated user from the session identity, then reloads the
 * authoritative role and account state from the database. Memoized per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      enabled: true,
      deleted: true,
      profile: { select: { image: true } },
    },
  });

  if (!user || user.deleted || !user.enabled) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.profile?.image ?? null,
  };
});

/**
 * Requires an authenticated user in a page or Server Action.
 * Route Handlers should use getCurrentUser and return a JSON 401 instead.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Requires an authenticated administrator in a page or Server Action.
 * A dedicated 403 page can replace this redirect in a later feature.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/home");
  }

  return user;
}
