import { prisma } from "@/lib/prisma";
import { buildPagination, type Paginated } from "@/lib/pagination";
import { sortDirection, type SortOrder } from "@/lib/sorting";

export type UserRole = "ADMIN" | "USER";
export type UserView = "active" | "deleted";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  deleted: boolean;
  createdAt: Date;
};

/** Reads the active/deleted users view from a query parameter. */
export function parseUserView(
  value: string | string[] | undefined,
): UserView {
  return value === "deleted" ? "deleted" : "active";
}

/** Lists users, optionally filtering by name or email. */
export async function getUsers({
  search,
  page = 1,
  view = "active",
  order = "newest",
}: {
  search?: string;
  page?: number;
  view?: UserView;
  order?: SortOrder;
} = {}): Promise<Paginated<UserRow>> {
  const term = search?.trim();
  const direction = sortDirection(order);
  const where = {
    deleted: view === "deleted",
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            { email: { contains: term, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.user.count({ where });
  const pagination = buildPagination(total, page);

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      deleted: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: direction }, { id: direction }],
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });

  return { items: users, pagination };
}
