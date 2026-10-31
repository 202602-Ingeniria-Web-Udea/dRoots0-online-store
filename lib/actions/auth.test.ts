import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("@/auth", () => ({
  signIn: mocks.signIn,
}));

vi.mock("next-auth", () => {
  class AuthError extends Error {
    type: string;

    constructor(type: string) {
      super(type);
      this.type = type;
    }
  }

  return { AuthError };
});

import { AuthError } from "next-auth";

import { authenticate } from "./auth";

function form(email?: string, password?: string) {
  const data = new FormData();

  if (email !== undefined) data.set("email", email);
  if (password !== undefined) data.set("password", password);

  return data;
}

describe("authenticate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires both email and password", async () => {
    const result = await authenticate(undefined, form());

    expect(result).toEqual({ error: "Enter your email and password." });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("signs in with credentials and redirects to the dashboard", async () => {
    mocks.signIn.mockResolvedValue(undefined);

    const result = await authenticate(
      undefined,
      form("user@example.com", "secret")
    );

    expect(result).toBeUndefined();
    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "secret",
      redirectTo: "/home",
    });
  });

  it("returns a generic message for invalid credentials", async () => {
    mocks.signIn.mockRejectedValue(new AuthError("CredentialsSignin"));

    const result = await authenticate(
      undefined,
      form("user@example.com", "wrong")
    );

    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("returns a generic message for other authentication errors", async () => {
    mocks.signIn.mockRejectedValue(new AuthError("AccessDenied"));

    const result = await authenticate(
      undefined,
      form("user@example.com", "secret")
    );

    expect(result).toEqual({
      error: "Unable to sign in. Please try again.",
    });
  });

  it("rethrows unexpected errors", async () => {
    mocks.signIn.mockRejectedValue(new Error("unexpected"));

    await expect(
      authenticate(undefined, form("user@example.com", "secret"))
    ).rejects.toThrow("unexpected");
  });
});
