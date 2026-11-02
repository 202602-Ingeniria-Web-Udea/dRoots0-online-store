import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryMaster: {
      findUnique: mocks.findUnique,
    },
  },
}));

import { getMasterDetail, parseMovementType } from "./movement-queries";

describe("getMasterDetail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null for an unknown master", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(getMasterDetail("missing")).resolves.toBeNull();
    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "missing" } })
    );
  });

  it("maps movements, responsible names, and current balance", async () => {
    const occurredAt = new Date("2026-10-30T10:00:00Z");
    mocks.findUnique.mockResolvedValue({
      id: "master-1",
      name: "Widget",
      initialBalance: "10",
      movements: [
        {
          id: "movement-1",
          occurredAt,
          type: "INCOMING",
          quantity: "5",
          responsible: { name: "Ada", lastName: "Lovelace" },
        },
        {
          id: "movement-2",
          occurredAt,
          type: "OUTGOING",
          quantity: "2",
          responsible: { name: "Grace", lastName: null },
        },
      ],
    });

    const result = await getMasterDetail("master-1");

    expect(result).toMatchObject({
      id: "master-1",
      name: "Widget",
      currentBalance: "13",
      movements: [
        {
          id: "movement-1",
          occurredAt,
          type: "INCOMING",
          quantity: "5",
          responsible: "Ada Lovelace",
        },
        {
          id: "movement-2",
          occurredAt,
          type: "OUTGOING",
          quantity: "2",
          responsible: "Grace",
        },
      ],
    });
    expect(result?.movementPagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    });
    // The series starts on the day of the first movement (America/Bogota).
    expect(result?.daily[0]).toEqual({ date: "2026-10-30", balance: "13" });
  });

  it("filters displayed movements without changing balances or the chart", async () => {
    const occurredAt = new Date("2026-10-30T10:00:00Z");
    mocks.findUnique.mockResolvedValue({
      id: "master-1",
      name: "Widget",
      initialBalance: "10",
      movements: [
        {
          id: "movement-1",
          occurredAt,
          type: "INCOMING",
          quantity: "5",
          responsible: { name: "Ada", lastName: "Lovelace" },
        },
        {
          id: "movement-2",
          occurredAt,
          type: "OUTGOING",
          quantity: "2",
          responsible: { name: "Grace", lastName: null },
        },
      ],
    });

    const result = await getMasterDetail("master-1", "OUTGOING");

    expect(result?.movements.map((movement) => movement.id)).toEqual([
      "movement-2",
    ]);
    expect(result?.movementPagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    expect(result?.currentBalance).toBe("13");
    expect(result?.daily[0]).toEqual({ date: "2026-10-30", balance: "13" });
  });

  it("returns ten movements per page and clamps out-of-range pages", async () => {
    const occurredAt = new Date("2026-10-30T10:00:00Z");
    mocks.findUnique.mockResolvedValue({
      id: "master-1",
      name: "Widget",
      initialBalance: "0",
      movements: Array.from({ length: 25 }, (_, index) => ({
        id: `movement-${index + 1}`,
        occurredAt,
        type: "INCOMING",
        quantity: "1",
        responsible: { name: "Ada", lastName: null },
      })),
    });

    const result = await getMasterDetail("master-1", undefined, 3);

    expect(result?.movements).toHaveLength(5);
    expect(result?.movements[0]?.id).toBe("movement-21");
    expect(result?.movements[4]?.id).toBe("movement-25");
    expect(result?.movementPagination).toEqual({
      page: 3,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });

    const clamped = await getMasterDetail("master-1", undefined, 99);

    expect(clamped?.movements).toHaveLength(5);
    expect(clamped?.movements[0]?.id).toBe("movement-21");
    expect(clamped?.movementPagination.page).toBe(3);
    expect(clamped?.currentBalance).toBe("25");
    expect(clamped?.daily.at(-1)?.balance).toBe("25");
  });
});

describe("parseMovementType", () => {
  it("accepts only supported movement types", () => {
    expect(parseMovementType("INCOMING")).toBe("INCOMING");
    expect(parseMovementType("OUTGOING")).toBe("OUTGOING");
    expect(parseMovementType("SIDEWAYS")).toBeUndefined();
    expect(parseMovementType(["INCOMING", "OUTGOING"])).toBeUndefined();
    expect(parseMovementType(undefined)).toBeUndefined();
  });
});
