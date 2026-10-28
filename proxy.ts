import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) =>
    SESSION_COOKIE_NAMES.some(
      (cookieName) => name === cookieName || name.startsWith(`${cookieName}.`)
    )
  );
}

/**
 * Optimistic pre-filter only. The real authorization checks run in the
 * (main) layout and in each protected page/server action via the DAL.
 */
export function proxy(request: NextRequest) {
  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/masters",
    "/masters/:path*",
    "/transactions",
    "/transactions/:path*",
    "/users",
    "/users/:path*",
  ],
};
