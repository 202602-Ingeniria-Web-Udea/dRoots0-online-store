import { prisma } from "@/lib/prisma";

import {
  buildDailyBalances,
  computeCurrentBalance,
  type DailyBalance,
} from "./balance";
import { formatPersonName } from "./format";

export interface MovementRow {
  id: string;
  occurredAt: Date;
  type: "INCOMING" | "OUTGOING";
  quantity: string;
  responsible: string;
}

export interface MasterDetail {
  id: string;
  name: string;
  currentBalance: string;
  movements: MovementRow[];
  daily: DailyBalance[];
}

/** Returns null when the master does not exist. */
export async function getMasterDetail(
  masterId: string,
): Promise<MasterDetail | null> {
  const master = await prisma.inventoryMaster.findUnique({
    where: { id: masterId },
    select: {
      id: true,
      name: true,
      initialBalance: true,
      movements: {
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          occurredAt: true,
          type: true,
          quantity: true,
          responsible: { select: { name: true, lastName: true } },
        },
      },
    },
  });
  if (!master) return null;

  const movements: MovementRow[] = master.movements.map((movement) => ({
    id: movement.id,
    occurredAt: movement.occurredAt,
    type: movement.type,
    quantity: movement.quantity.toString(),
    responsible: formatPersonName(movement.responsible),
  }));

  return {
    id: master.id,
    name: master.name,
    currentBalance: computeCurrentBalance(
      master.initialBalance,
      master.movements,
    ).toFixed(),
    movements,
    daily: buildDailyBalances(master.initialBalance, master.movements, {
      until: new Date(),
    }),
  };
}