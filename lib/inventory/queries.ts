import { prisma } from "@/lib/prisma";

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
export async function getMastersWithBalances(): Promise<MasterRow[]> {
  const masters = await prisma.inventoryMaster.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      initialBalance: true,
      createdAt: true,
      createdBy: { select: { name: true, lastName: true } },
      movements: { select: { type: true, quantity: true } },
    },
  });

  return masters.map((master) => ({
    id: master.id,
    name: master.name,
    currentBalance: computeCurrentBalance(
      master.initialBalance,
      master.movements,
    ).toFixed(),
    creator: formatPersonName(master.createdBy),
    createdAt: master.createdAt,
  }));
}

export async function getMasterOptions(): Promise<MasterOption[]> {
  return prisma.inventoryMaster.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}