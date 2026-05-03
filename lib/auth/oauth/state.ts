import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const OAUTH_STATE_COOKIE = "oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

export function generateState(): string {
  return randomBytes(16).toString("hex");
}

export async function setStateCookie(state: string): Promise<void> {
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + STATE_TTL_MS),
  });
}

export async function consumeStateCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(OAUTH_STATE_COOKIE)?.value ?? null;
  jar.delete(OAUTH_STATE_COOKIE);
  return value;
}
