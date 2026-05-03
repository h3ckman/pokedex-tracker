import { cookies } from "next/headers";

export const ACTIVE_CHARACTER_COOKIE = "active_character";

export async function readActiveCharacterId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACTIVE_CHARACTER_COOKIE)?.value ?? null;
}

export async function writeActiveCharacterId(id: string): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_CHARACTER_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveCharacterId(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACTIVE_CHARACTER_COOKIE);
}
