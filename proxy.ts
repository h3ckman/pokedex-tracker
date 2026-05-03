import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const PUBLIC_PATHS = ["/login", "/register", "/verify-email"];

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET env var missing or too short.");
  }
  return new TextEncoder().encode(s);
}

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sid === "string";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValid(token);

  if (!authed && !isPublic) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // Intentionally do NOT redirect authed users away from /login here.
  // The proxy only verifies the JWT signature; the DB session may be gone
  // (revoked, expired-row, wiped during development). Letting /login handle
  // that check via getSession() avoids a redirect loop when cookie and DB
  // disagree — the login page clears the stale cookie and shows the form.
  return NextResponse.next();
}

export const config = {
  // Exclude Next internals, the auth-callback API surface, and any request
  // for a file with an extension (e.g. /logo.png, /file.svg) so that
  // public/ assets are served without going through the auth gate.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/.*|.*\\..*).*)",
  ],
};
