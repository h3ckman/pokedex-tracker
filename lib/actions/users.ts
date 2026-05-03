"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/can";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/auth/audit";
import type { Role } from "@/lib/generated/prisma/client";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const RoleEnum = z.enum(["ADMIN", "SITE_MANAGER", "TECHNICIAN", "VIEWER"]);

const InviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: RoleEnum,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function inviteUser(
  _prev: { error: string | null } | undefined,
  formData: FormData,
): Promise<{ error: string | null }> {
  const guard = await authorize("ADMIN");
  if (!guard.data) return { error: guard.error };
  const { userId: actorId } = guard.data;

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
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
    return { error: "A user with that email already exists" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const created = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
      emailVerified: new Date(),
    },
    select: { id: true },
  });

  await logAudit(actorId, "USER_INVITED", {
    targetUserId: created.id,
    email,
    role: parsed.data.role,
  });

  revalidatePath("/settings/users");
  return { error: null };
}

export async function changeUserRole(
  userId: string,
  newRole: Role,
): Promise<ActionResult<{ id: string; role: Role }>> {
  const guard = await authorize("ADMIN");
  if (!guard.data) return { data: null, error: guard.error };
  const { userId: actorId } = guard.data;

  const parsed = RoleEnum.safeParse(newRole);
  if (!parsed.success) return { data: null, error: "Invalid role" };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data },
    select: { id: true, role: true },
  });

  await logAudit(actorId, "ROLE_CHANGE", {
    targetUserId: userId,
    role: parsed.data,
  });

  revalidatePath("/settings/users");
  return { data: updated, error: null };
}

export async function deactivateUser(
  userId: string,
): Promise<ActionResult<{ id: string }>> {
  const guard = await authorize("ADMIN");
  if (!guard.data) return { data: null, error: guard.error };
  const { userId: actorId } = guard.data;

  if (userId === actorId) {
    return { data: null, error: "Cannot deactivate your own account" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { active: false },
  });
  await prisma.session.deleteMany({ where: { userId } });
  await logAudit(actorId, "USER_DEACTIVATED", { targetUserId: userId });

  revalidatePath("/settings/users");
  return { data: { id: userId }, error: null };
}
