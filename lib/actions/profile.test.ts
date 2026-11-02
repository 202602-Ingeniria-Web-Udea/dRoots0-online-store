import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  upsert: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      upsert: mocks.upsert,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { updateProfileImage } from "./profile";

describe("updateProfileImage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated callers without writing", async () => {
    mocks.requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      updateProfileImage({ image: "/avatars/user.svg" })
    ).rejects.toThrow();

    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("rejects invalid image sources", async () => {
    const result = await updateProfileImage({
      image: "javascript:alert(1)",
    });

    expect(result.ok).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("updates only the current user's profile", async () => {
    mocks.upsert.mockResolvedValue({ image: "/avatars/user.svg" });

    const result = await updateProfileImage({
      image: "/avatars/user.svg",
    });

    expect(result).toEqual({
      ok: true,
      data: { image: "/avatars/user.svg" },
    });
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      update: { image: "/avatars/user.svg" },
      create: {
        userId: "user-1",
        image: "/avatars/user.svg",
        address: "",
        phone: "",
      },
      select: { image: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("accepts an https image URL", async () => {
    mocks.upsert.mockResolvedValue({
      image: "https://example.com/avatar.png",
    });

    const result = await updateProfileImage({
      image: "https://example.com/avatar.png",
    });

    expect(result.ok).toBe(true);
    expect(mocks.upsert).toHaveBeenCalled();
  });

  it("returns a safe error on database failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.upsert.mockRejectedValue(new Error("database unavailable"));

    const result = await updateProfileImage({
      image: "/avatars/user.svg",
    });

    expect(result).toEqual({
      ok: false,
      error: "Could not update the profile image. Please try again.",
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
