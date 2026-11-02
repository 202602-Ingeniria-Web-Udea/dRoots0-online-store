import { prisma } from "@/lib/prisma";
import { buildPagination, type Paginated } from "@/lib/pagination";

export type UserRole = "ADMIN" | "USER";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

/** Lists users, optionally filtering by name or email. */
export async function getUsers({
  search,
  page = 1,
}: {
  search?: string;
  page?: number;
} = {}): Promise<Paginated<UserRow>> {
  const term = search?.trim();
  const where = term
    ? {
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { email: { contains: term, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const total = await prisma.user.count({ where });
  const pagination = buildPagination(total, page);

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });

  return { items: users, pagination };
}
