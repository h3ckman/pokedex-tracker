import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@/lib/generated/prisma/client";

const COOKIE_NAME = "session";
const SESSION_DAYS = 7;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET env var missing or too short (need 32+ chars).",
    );
  }
  return new TextEncoder().encode(s);
}

export async function signSessionToken(sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string,
): Promise<{ sid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sid !== "string") return null;
    return { sid: payload.sid };
  } catch {
    return null;
  }
}

export type SessionUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "emailVerified"
>;

export type Session = {
  sessionId: string;
  user: SessionUser;
};

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
    select: { id: true },
  });
  const token = await signSessionToken(session.id);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const verified = await verifySessionToken(token);
  if (!verified) return null;

  const session = await prisma.session.findUnique({
    where: { id: verified.sid },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          emailVerified: true,
        },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  if (!session.user.active) return null;

  return {
    sessionId: session.id,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified,
    },
  };
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const verified = await verifySessionToken(token);
    if (verified) {
      await prisma.session
        .delete({ where: { id: verified.sid } })
        .catch(() => null);
    }
  }
  jar.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export type { Role };
