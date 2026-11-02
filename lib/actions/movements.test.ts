import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  master: null as { initialBalance: string } | null,
  movements: [] as { type: "INCOMING" | "OUTGOING"; quantity: string }[],
  created: [] as Record<string, unknown>[],
  conflictsLeft: 0,
  transactionCalls: 0,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireUser: vi.fn() }));

vi.mock("@/lib/prisma", () => {
  const tx = {
    inventoryMaster: { findUnique: vi.fn(async () => state.master) },
    inventoryMovement: {
      findMany: vi.fn(async () => state.movements),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.created.push(data);
        return { id: "movement-1" };
      }),
    },
  };
  return {
    prisma: {
      $transaction: vi.fn(async (work: (client: typeof tx) => Promise<unknown>) => {
        state.transactionCalls += 1;
        if (state.conflictsLeft > 0) {
          state.conflictsLeft -= 1;
          throw Object.assign(new Error("write conflict"), { code: "P2034" });
        }
        return work(tx);
      }),
    },
  };
});

import { requireUser } from "@/lib/auth/session";

import { createMovement } from "./movements";

const valid = { masterId: "master-1", type: "INCOMING", quantity: "5" };

beforeEach(() => {
  state.master = { initialBalance: "10" };
  state.movements = [];
  state.created = [];
  state.conflictsLeft = 0;
  state.transactionCalls = 0;
  vi.mocked(requireUser).mockResolvedValue({ id: "user-from-session" } as never);
});

describe("createMovement", () => {
  it("creates a valid incoming movement using the session user as responsible", async () => {
    const result = await createMovement({ ...valid, responsibleId: "spoofed" });
    expect(result).toEqual({ ok: true, data: { id: "movement-1" } });
    expect(state.created[0]).toMatchObject({
      masterId: "master-1",
      type: "INCOMING",
      quantity: "5",
      responsibleId: "user-from-session",
    });
  });

  it("creates a valid outgoing movement that leaves the balance at zero", async () => {
    const result = await createMovement({ ...valid, type: "OUTGOING", quantity: "10" });
    expect(result.ok).toBe(true);
  });

  it.each(["0", "-1", "abc", "", "1e3", "NaN", "Infinity"])("rejects quantity %p", async (quantity) => {
    const result = await createMovement({ ...valid, quantity });
    expect(result.ok).toBe(false);
    expect(state.created).toHaveLength(0);
  });

  it("rejects outgoing movements that exceed the current balance", async () => {
    state.movements = [{ type: "OUTGOING", quantity: "4" }]; // balance = 6
    const result = await createMovement({ ...valid, type: "OUTGOING", quantity: "7" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { quantity: expect.any(String) } });
    expect(state.created).toHaveLength(0);
  });

  it("fails when the master does not exist", async () => {
    state.master = null;
    const result = await createMovement(valid);
    expect(result).toMatchObject({ ok: false, error: "Inventory master not found." });
    expect(state.created).toHaveLength(0);
  });

  it("propagates authentication failures and writes nothing", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(createMovement(valid)).rejects.toThrow("NEXT_REDIRECT");
    expect(state.created).toHaveLength(0);
  });

  it("retries after a serialization failure and then succeeds", async () => {
    state.conflictsLeft = 2;
    const result = await createMovement(valid);
    expect(result.ok).toBe(true);
    expect(state.transactionCalls).toBe(3);
  });

  it("returns a safe generic error when conflicts never stop", async () => {
    state.conflictsLeft = 100;
    const result = await createMovement(valid);
    expect(result).toEqual({
      ok: false,
      error: "Could not register the movement. Please try again.",
    });
    expect(state.created).toHaveLength(0);
  });
});