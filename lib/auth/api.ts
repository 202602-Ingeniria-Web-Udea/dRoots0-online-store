import "server-only";

import { NextResponse } from "next/server";

import { getCurrentUser, type SessionUser } from "@/lib/auth/session";

type ApiAuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

/** Returns 401 JSON when no valid session/user exists. */
export async function requireApiUser(): Promise<ApiAuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, user };
}

/** Returns 401/403 JSON unless the caller is a valid administrator. */
export async function requireApiAdmin(): Promise<ApiAuthResult> {
  const result = await requireApiUser();

  if (!result.ok) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
