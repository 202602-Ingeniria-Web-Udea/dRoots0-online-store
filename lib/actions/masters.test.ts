import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  create: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inventoryMaster: {
      create: mocks.create,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { createMaster } from "./masters";

describe("createMaster", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated or non-admin callers without creating anything", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      createMaster({ name: "Widget", initialBalance: "10" })
    ).rejects.toThrow();

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await createMaster({ name: "a", initialBalance: "-5" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.name).toBeTruthy();
      expect(result.fieldErrors?.initialBalance).toBeTruthy();
    }
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates the master with the session administrator id and revalidates", async () => {
    mocks.create.mockResolvedValue({ id: "master-1" });

    const result = await createMaster({ name: "Widget", initialBalance: "10.5" });

    expect(result).toEqual({ ok: true, data: { id: "master-1" } });
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        name: "Widget",
        initialBalance: "10.5",
        createdById: "admin-1",
      },
      select: { id: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/masters");
  });

  it("maps duplicate names to a field error", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });

    const result = await createMaster({ name: "Widget", initialBalance: "10" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.name).toContain("already exists");
    }
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a safe error for unexpected database failures", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.create.mockRejectedValue(new Error("database unavailable"));

    const result = await createMaster({ name: "Widget", initialBalance: "10" });

    expect(result).toEqual({
      ok: false,
      error: "Could not create the master. Please try again.",
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
