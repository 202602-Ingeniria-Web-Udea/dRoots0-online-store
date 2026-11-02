import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  masters: vi.fn(),
  movementCount: vi.fn(),
  recent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryMaster: {
      findMany: mocks.masters,
    },
    inventoryMovement: {
      count: mocks.movementCount,
      findMany: mocks.recent,
    },
  },
}));

import { getDashboardSummary, LOW_STOCK_THRESHOLD } from "./dashboard";

describe("getDashboardSummary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calculates totals, low stock, and recent activity", async () => {
    const occurredAt = new Date("2026-11-01T10:00:00Z");

    mocks.masters.mockResolvedValue([
      {
        id: "master-1",
        initialBalance: "10",
        movements: [
          { type: "INCOMING", quantity: "50" },
          { type: "OUTGOING", quantity: "5" },
        ],
      },
      {
        id: "master-2",
        initialBalance: "30",
        movements: [],
      },
    ]);
    mocks.movementCount.mockResolvedValue(4);
    mocks.recent.mockResolvedValue([
      {
        id: "movement-1",
        type: "INCOMING",
        quantity: "5",
        occurredAt,
        master: { id: "master-1", name: "Widget" },
        responsible: { name: "Ada", lastName: "Lovelace" },
      },
    ]);

    const result = await getDashboardSummary();

    expect(result).toEqual({
      masterCount: 2,
      movementCount: 4,
      totalInventory: "85",
      lowStockCount: 1,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      recentMovements: [
        {
          id: "movement-1",
          masterId: "master-1",
          masterName: "Widget",
          type: "INCOMING",
          quantity: "5",
          occurredAt,
          responsible: "Ada Lovelace",
        },
      ],
    });
  });

  it("handles an empty inventory", async () => {
    mocks.masters.mockResolvedValue([]);
    mocks.movementCount.mockResolvedValue(0);
    mocks.recent.mockResolvedValue([]);

    const result = await getDashboardSummary();

    expect(result).toEqual({
      masterCount: 0,
      movementCount: 0,
      totalInventory: "0",
      lowStockCount: 0,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      recentMovements: [],
    });
  });
});
