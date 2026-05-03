"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  deleteSession,
  getSession,
} from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user || !user.active) {
    return { error: "Invalid email or password" };
  }
  if (!user.passwordHash) {
    return { error: "This account uses Google sign-in" };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Invalid email or password" };
  }

  if (!user.emailVerified) {
    redirect(
      `/verify-email?email=${encodeURIComponent(normalizedEmail)}&unverified=1`,
    );
  }

  await createSession(user.id);
  await logAudit(user.id, "LOGIN");

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session) {
    await logAudit(session.user.id, "LOGOUT");
  }
  await deleteSession();
  redirect("/login");
}
