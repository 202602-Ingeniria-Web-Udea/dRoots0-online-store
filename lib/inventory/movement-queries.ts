import { prisma } from "@/lib/prisma";
import { buildPagination, type Pagination } from "@/lib/pagination";

import {
  buildDailyBalances,
  computeCurrentBalance,
  type DailyBalance,
} from "./balance";
import { formatPersonName } from "./format";

export type MovementType = "INCOMING" | "OUTGOING";

export interface MovementRow {
  id: string;
  occurredAt: Date;
  type: MovementType;
  quantity: string;
  responsible: string;
}

/** Reads a movement-type filter from a query parameter. */
export function parseMovementType(
  value: string | string[] | undefined,
): MovementType | undefined {
  if (value === "INCOMING" || value === "OUTGOING") return value;
  return undefined;
}

export interface MasterDetail {
  id: string;
  name: string;
  currentBalance: string;
  movements: MovementRow[];
  movementPagination: Pagination;
  daily: DailyBalance[];
}

/**
 * Returns null when the master does not exist. The optional movement type only
 * filters the displayed rows; balances and the daily series always use the
 * complete movement history.
 */
export async function getMasterDetail(
  masterId: string,
  movementType?: MovementType,
  requestedPage = 1,
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

  const filteredMovements: MovementRow[] = master.movements
    .filter((movement) => !movementType || movement.type === movementType)
    .map((movement) => ({
      id: movement.id,
      occurredAt: movement.occurredAt,
      type: movement.type,
      quantity: movement.quantity.toString(),
      responsible: formatPersonName(movement.responsible),
    }));

  const movementPagination = buildPagination(
    filteredMovements.length,
    requestedPage,
  );
  const start = (movementPagination.page - 1) * movementPagination.pageSize;
  const movements = filteredMovements.slice(
    start,
    start + movementPagination.pageSize,
  );

  return {
    id: master.id,
    name: master.name,
    currentBalance: computeCurrentBalance(
      master.initialBalance,
      master.movements,
    ).toFixed(),
    movements,
    movementPagination,
    daily: buildDailyBalances(master.initialBalance, master.movements, {
      until: new Date(),
    }),
  };
}
