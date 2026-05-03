import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const RESEND_HOURLY_LIMIT = 5;

export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashCode(code: string, userId: string): string {
  const pepper = process.env.AUTH_SECRET ?? "";
  return createHash("sha256")
    .update(`${code}:${userId}:${pepper}`)
    .digest("hex");
}

export async function createVerificationCode(
  userId: string,
): Promise<{ code: string; id: string }> {
  const code = generateCode();
  const codeHash = hashCode(code, userId);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const record = await prisma.emailVerificationCode.create({
    data: { userId, codeHash, expiresAt },
    select: { id: true },
  });
  return { code, id: record.id };
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "invalid" | "exhausted" | "not_found" };

export async function consumeVerificationCode(
  userId: string,
  code: string,
): Promise<ConsumeResult> {
  const record = await prisma.emailVerificationCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
      attempts: true,
    },
  });
  if (!record) return { ok: false, reason: "not_found" };

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "exhausted" };
  }
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  const expected = hashCode(code, userId);
  if (expected !== record.codeHash) {
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const nextAttempts = record.attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      return { ok: false, reason: "exhausted" };
    }
    return { ok: false, reason: "invalid" };
  }

  await prisma.emailVerificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date(), attempts: { increment: 1 } },
  });
  return { ok: true };
}

export type CanSendResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export async function canSendCode(userId: string): Promise<CanSendResult> {
  const now = Date.now();
  const recent = await prisma.emailVerificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent) {
    const elapsed = now - recent.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
      };
    }
  }

  const hourAgo = new Date(now - 60 * 60 * 1000);
  const hourly = await prisma.emailVerificationCode.count({
    where: { userId, createdAt: { gte: hourAgo } },
  });
  if (hourly >= RESEND_HOURLY_LIMIT) {
    return { ok: false, retryAfterSeconds: 60 * 60 };
  }
  return { ok: true };
}
