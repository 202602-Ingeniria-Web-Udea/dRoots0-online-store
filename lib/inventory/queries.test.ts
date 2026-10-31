import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryMaster: {
      findMany: mocks.findMany,
    },
  },
}));

import { getMasterOptions, getMastersWithBalances } from "./queries";

describe("getMastersWithBalances", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("computes current balances and formats creator names", async () => {
    const createdAt = new Date("2026-10-01T12:00:00Z");
    mocks.findMany.mockResolvedValue([
      {
        id: "master-1",
        name: "Widget",
        initialBalance: "10",
        createdAt,
        createdBy: { name: "Ada", lastName: "Lovelace" },
        movements: [
          { type: "INCOMING", quantity: "5" },
          { type: "OUTGOING", quantity: "2" },
        ],
      },
    ]);

    const result = await getMastersWithBalances();

    expect(result).toEqual([
      {
        id: "master-1",
        name: "Widget",
        currentBalance: "13",
        creator: "Ada Lovelace",
        createdAt,
      },
    ]);
  });
});

describe("getMasterOptions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns only the id and name, ordered by name", async () => {
    mocks.findMany.mockResolvedValue([{ id: "master-1", name: "Widget" }]);

    const result = await getMasterOptions();

    expect(result).toEqual([{ id: "master-1", name: "Widget" }]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  });
});
