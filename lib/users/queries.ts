import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "USER";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

/** Lists users, optionally filtering by name or email. */
export async function getUsers(search?: string): Promise<UserRow[]> {
  const term = search?.trim();

  return prisma.user.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
