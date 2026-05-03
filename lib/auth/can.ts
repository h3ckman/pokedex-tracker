import { redirect } from "next/navigation";
import type { Role } from "@/lib/generated/prisma/client";

const RANK: Record<Role, number> = {
  VIEWER: 0,
  TECHNICIAN: 1,
  SITE_MANAGER: 2,
  ADMIN: 3,
};

export function can(userRole: Role, requiredRole: Role): boolean {
  return RANK[userRole] >= RANK[requiredRole];
}

export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type AuthorizedContext = {
  userId: string;
  role: Role;
};

/**
 * For server actions: returns ActionResult-compatible guard.
 * Usage: `const guard = await authorize("SITE_MANAGER"); if (guard.error) return guard;`
 */
export async function authorize(
  requiredRole: Role,
): Promise<AuthResult<AuthorizedContext>> {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) {
    return { data: null, error: "Unauthorized" };
  }
  if (!can(session.user.role, requiredRole)) {
    return { data: null, error: "Forbidden" };
  }
  return {
    data: { userId: session.user.id, role: session.user.role },
    error: null,
  };
}

/**
 * For server components: redirects to /login if no session, to / if role is
 * insufficient.
 */
export async function requireRole(requiredRole: Role) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) redirect("/login");
  if (!can(session.user.role, requiredRole)) redirect("/");
  return session;
}

export async function requireAuth() {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireVerifiedAuth() {
  const session = await requireAuth();
  if (!session.user.emailVerified) redirect("/verify-email");
  return session;
}
