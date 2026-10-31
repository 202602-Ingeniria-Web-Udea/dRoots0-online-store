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

import { getMasterDetail } from "./movement-queries";

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

    expect(result).toEqual({
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
  });
});
