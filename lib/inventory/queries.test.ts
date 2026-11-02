import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryMaster: {
      findMany: mocks.findMany,
      count: mocks.count,
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
    mocks.count.mockResolvedValue(1);
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

    expect(result).toEqual({
      items: [
        {
          id: "master-1",
          name: "Widget",
          currentBalance: "13",
          creator: "Ada Lovelace",
          createdAt,
        },
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });
  });

  it("filters masters by a case-insensitive name search", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await getMastersWithBalances({ search: "coffee" });

    expect(mocks.count).toHaveBeenCalledWith({
      where: { name: { contains: "coffee", mode: "insensitive" } },
    });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { contains: "coffee", mode: "insensitive" } },
      }),
    );
  });

  it("does not filter when the search is blank", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.findMany.mockResolvedValue([]);

    await getMastersWithBalances({ search: "   " });

    expect(mocks.count).toHaveBeenCalledWith({ where: undefined });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it("requests only the current page of ten rows", async () => {
    mocks.count.mockResolvedValue(24);
    mocks.findMany.mockResolvedValue([]);

    const result = await getMastersWithBalances({ page: 3 });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
    expect(result.pagination).toEqual({
      page: 3,
      pageSize: 10,
      total: 24,
      totalPages: 3,
    });
  });

  it("clamps an out-of-range page to the last page", async () => {
    mocks.count.mockResolvedValue(12);
    mocks.findMany.mockResolvedValue([]);

    const result = await getMastersWithBalances({ page: 99 });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2,
    });
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
