"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";
import {
  CODE_TTL_MS,
  canSendCode,
  consumeVerificationCode,
  createVerificationCode,
} from "@/lib/auth/verification";
import { sendEmail } from "@/lib/email/send";
import { verificationEmail } from "@/lib/email/templates/verification";

export type RegisterState = { error: string | null };

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: "VIEWER",
      emailVerified: null,
    },
    select: { id: true },
  });

  const { code } = await createVerificationCode(user.id);
  const message = verificationEmail({
    code,
    expiresInMinutes: Math.floor(CODE_TTL_MS / 60_000),
  });
  await sendEmail({
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  await logAudit(user.id, "REGISTER_EMAIL");

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export type VerifyEmailState = { error: string | null };

const VerifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function verifyEmailAction(
  _prev: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const parsed = VerifyEmailSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true, active: true },
  });
  if (!user || !user.active || user.emailVerified) {
    return { error: "Invalid code" };
  }

  const result = await consumeVerificationCode(user.id, parsed.data.code);
  if (!result.ok) {
    switch (result.reason) {
      case "expired":
        return { error: "That code has expired. Send a new one." };
      case "exhausted":
        return {
          error: "Too many incorrect attempts. Send a new code.",
        };
      case "not_found":
        return { error: "No active code. Send a new one." };
      default:
        return { error: "Invalid code" };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await createSession(user.id);
  await logAudit(user.id, "EMAIL_VERIFIED");

  redirect("/");
}

export type ResendVerificationState = { error: string | null };

const ResendSchema = z.object({
  email: z.string().email(),
});

export async function resendVerificationAction(
  _prev: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const parsed = ResendSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true, active: true },
  });
  if (!user || !user.active || user.emailVerified) {
    return { error: null };
  }

  const can = await canSendCode(user.id);
  if (!can.ok) {
    return {
      error: `Please wait ${can.retryAfterSeconds}s before requesting another code`,
    };
  }

  const { code } = await createVerificationCode(user.id);
  const message = verificationEmail({
    code,
    expiresInMinutes: Math.floor(CODE_TTL_MS / 60_000),
  });
  await sendEmail({
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
  await logAudit(user.id, "VERIFICATION_RESENT");

  return { error: null };
}
