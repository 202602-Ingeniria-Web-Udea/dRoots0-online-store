import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { updateUserRole } from "./users";

describe("updateUserRole", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1" });
  });

  it("rejects changing your own role without touching the database", async () => {
    const result = await updateUserRole({ userId: "admin-1", role: "USER" });

    expect(result).toEqual({
      ok: false,
      error: "You cannot change your own role.",
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    const result = await updateUserRole({ userId: "", role: "OWNER" });

    expect(result.ok).toBe(false);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a missing target user", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await updateUserRole({ userId: "user-2", role: "ADMIN" });

    expect(result).toEqual({ ok: false, error: "User not found." });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates another user's role and revalidates the users page", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-2" });
    mocks.update.mockResolvedValue({});

    const result = await updateUserRole({ userId: "user-2", role: "ADMIN" });

    expect(result).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { role: "ADMIN" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("does not update when authorization fails", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      updateUserRole({ userId: "user-2", role: "ADMIN" })
    ).rejects.toThrow();

    expect(mocks.update).not.toHaveBeenCalled();
  });
});
