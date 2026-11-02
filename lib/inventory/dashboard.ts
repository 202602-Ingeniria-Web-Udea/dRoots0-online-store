import { Decimal } from "decimal.js";

import { prisma } from "@/lib/prisma";
import { computeCurrentBalance } from "./balance";
import { formatPersonName } from "./format";

export const LOW_STOCK_THRESHOLD = 50;

export type DashboardMovement = {
  id: string;
  masterId: string;
  masterName: string;
  type: "INCOMING" | "OUTGOING";
  quantity: string;
  occurredAt: Date;
  responsible: string;
};

export type DashboardSummary = {
  masterCount: number;
  movementCount: number;
  totalInventory: string;
  lowStockCount: number;
  lowStockThreshold: number;
  recentMovements: DashboardMovement[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [masters, movementCount, recent] = await Promise.all([
    prisma.inventoryMaster.findMany({
      select: {
        id: true,
        initialBalance: true,
        movements: {
          select: { type: true, quantity: true },
        },
      },
    }),
    prisma.inventoryMovement.count(),
    prisma.inventoryMovement.findMany({
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        type: true,
        quantity: true,
        occurredAt: true,
        master: { select: { id: true, name: true } },
        responsible: { select: { name: true, lastName: true } },
      },
    }),
  ]);

  let total = new Decimal(0);
  let lowStockCount = 0;

  for (const master of masters) {
    const balance = computeCurrentBalance(master.initialBalance, master.movements);
    total = total.plus(balance);

    if (balance.lte(LOW_STOCK_THRESHOLD)) {
      lowStockCount += 1;
    }
  }

  return {
    masterCount: masters.length,
    movementCount,
    totalInventory: total.toFixed(),
    lowStockCount,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    recentMovements: recent.map((movement) => ({
      id: movement.id,
      masterId: movement.master.id,
      masterName: movement.master.name,
      type: movement.type,
      quantity: movement.quantity.toString(),
      occurredAt: movement.occurredAt,
      responsible: formatPersonName(movement.responsible),
    })),
  };
}
