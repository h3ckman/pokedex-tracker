import { prisma } from "@/lib/prisma";

export async function logAudit(
  userId: string,
  action: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      detail: detail ? JSON.stringify(detail) : null,
    },
  });
}
