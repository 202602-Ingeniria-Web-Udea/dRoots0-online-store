import { prisma } from "@/lib/prisma";
import { buildPagination, type Paginated } from "@/lib/pagination";
import { sortDirection, type SortOrder } from "@/lib/sorting";

import { computeCurrentBalance } from "./balance";
import { formatPersonName } from "./format";

export interface MasterRow {
  id: string;
  name: string;
  currentBalance: string;
  creator: string;
  createdAt: Date;
}

export interface MasterOption {
  id: string;
  name: string;
}

/** Only non-sensitive user fields (name, lastName) are ever selected. */
export async function getMastersWithBalances({
  search,
  page = 1,
  order = "newest",
}: {
  search?: string;
  page?: number;
  order?: SortOrder;
} = {}): Promise<Paginated<MasterRow>> {
  const term = search?.trim();
  const where = term
    ? { name: { contains: term, mode: "insensitive" as const } }
    : undefined;
  const direction = sortDirection(order);

  const total = await prisma.inventoryMaster.count({ where });
  const pagination = buildPagination(total, page);

  const masters = await prisma.inventoryMaster.findMany({
    where,
    orderBy: [{ createdAt: direction }, { id: direction }],
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    select: {
      id: true,
      name: true,
      initialBalance: true,
      createdAt: true,
      createdBy: { select: { name: true, lastName: true } },
      movements: { select: { type: true, quantity: true } },
    },
  });

  return {
    items: masters.map((master) => ({
      id: master.id,
      name: master.name,
      currentBalance: computeCurrentBalance(
        master.initialBalance,
        master.movements,
      ).toFixed(),
      creator: formatPersonName(master.createdBy),
      createdAt: master.createdAt,
    })),
    pagination,
  };
}

export async function getMasterOptions(): Promise<MasterOption[]> {
  return prisma.inventoryMaster.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
