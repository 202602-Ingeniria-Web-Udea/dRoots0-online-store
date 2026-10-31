import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

async function loadSession() {
  vi.resetModules();
  return import("./session");
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null without a session", async () => {
    mocks.auth.mockResolvedValue(null);
    const { getCurrentUser } = await loadSession();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the user no longer exists", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.findUnique.mockResolvedValue(null);
    const { getCurrentUser } = await loadSession();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it.each([
    { enabled: false, deleted: false },
    { enabled: true, deleted: true },
  ])("returns null for disabled or deleted users (%o)", async (flags) => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      role: "USER",
      profile: null,
      ...flags,
    });
    const { getCurrentUser } = await loadSession();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the trusted user and profile image", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      role: "ADMIN",
      enabled: true,
      deleted: false,
      profile: { image: "https://example.com/ada.png" },
    });
    const { getCurrentUser } = await loadSession();

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      role: "ADMIN",
      image: "https://example.com/ada.png",
    });
  });

  it("redirects unauthenticated requests to the login page", async () => {
    mocks.auth.mockResolvedValue(null);
    const { requireUser } = await loadSession();

    await requireUser();

    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects non-admin users away from admin-only helpers", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      role: "USER",
      enabled: true,
      deleted: false,
      profile: null,
    });
    const { requireAdmin } = await loadSession();

    await requireAdmin();

    expect(mocks.redirect).toHaveBeenCalledWith("/home");
  });
});
