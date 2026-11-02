import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
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
      create: mocks.create,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { createUser, updateUserRole } from "./users";

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

describe("createUser", () => {
  const validInput = {
    name: "New User",
    email: "new@example.com",
    role: "USER" as const,
    password: "Secret123!",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1" });
  });

  it("rejects non-admin callers without creating a user", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(createUser(validInput)).rejects.toThrow();

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    const result = await createUser({
      name: "A",
      email: "not-an-email",
      role: "OWNER",
      password: "short",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.name).toBeTruthy();
      expect(result.fieldErrors?.email).toBeTruthy();
      expect(result.fieldErrors?.password).toBeTruthy();
    }
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates a user with a bcrypt password and profile image", async () => {
    mocks.create.mockResolvedValue({ id: "new-user-1" });

    const result = await createUser(validInput);

    expect(result).toEqual({
      ok: true,
      data: { id: "new-user-1" },
    });

    const firstCall = mocks.create.mock.calls[0]?.[0] as {
      data: {
        email: string;
        password: string;
        role: string;
        profile: { create: { image: string } };
      };
    };

    expect(firstCall.data.email).toBe("new@example.com");
    expect(firstCall.data.password).not.toBe("Secret123!");
    expect(firstCall.data.password).toMatch(/^\$2[aby]\$/);
    expect(firstCall.data.role).toBe("USER");
    expect(firstCall.data.profile.create.image).toBe("/avatars/user.svg");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("maps a duplicate email to a field error", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });

    const result = await createUser(validInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.email).toContain("already exists");
    }
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a safe error for unexpected database failures", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.create.mockRejectedValue(new Error("database unavailable"));

    const result = await createUser(validInput);

    expect(result).toEqual({
      ok: false,
      error: "Could not create the user. Please try again.",
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
