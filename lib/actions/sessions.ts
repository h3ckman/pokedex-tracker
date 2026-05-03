"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function assertDm(
  campaignId: string,
): Promise<{ userId: string } | null> {
  const session = await getSession();
  if (!session) return null;
  const m = await prisma.campaignMembership.findUnique({
    where: {
      campaignId_userId: { campaignId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!m || m.role !== "DM") return null;
  return { userId: session.user.id };
}

const SessionSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default(""),
  sessionDate: z.string().optional(),
});

export async function createSessionLog(
  campaignId: string,
  input: z.infer<typeof SessionSchema>,
): Promise<ActionResult<{ id: string }>> {
  const dm = await assertDm(campaignId);
  if (!dm) return { data: null, error: "Only the DM can add session entries" };
  const parsed = SessionSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const created = await prisma.sessionLog.create({
    data: {
      campaignId,
      authorUserId: dm.userId,
      title: parsed.data.title,
      body: parsed.data.body,
      sessionDate: parsed.data.sessionDate
        ? new Date(parsed.data.sessionDate)
        : null,
    },
    select: { id: true },
  });
  revalidatePath(`/campaigns/${campaignId}/sessions`);
  return { data: created, error: null };
}

export async function updateSessionLog(
  sessionLogId: string,
  input: z.infer<typeof SessionSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const entry = await prisma.sessionLog.findUnique({
    where: { id: sessionLogId },
    select: { authorUserId: true, campaignId: true },
  });
  if (!entry || entry.authorUserId !== session.user.id) {
    return { data: null, error: "Only the author can edit this entry" };
  }
  const parsed = SessionSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  await prisma.sessionLog.update({
    where: { id: sessionLogId },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      sessionDate: parsed.data.sessionDate
        ? new Date(parsed.data.sessionDate)
        : null,
    },
  });
  revalidatePath(`/campaigns/${entry.campaignId}/sessions`);
  return { data: { id: sessionLogId }, error: null };
}

export async function deleteSessionLog(
  sessionLogId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const entry = await prisma.sessionLog.findUnique({
    where: { id: sessionLogId },
    select: { authorUserId: true, campaignId: true },
  });
  if (!entry || entry.authorUserId !== session.user.id) {
    return { data: null, error: "Only the author can delete this entry" };
  }
  await prisma.sessionLog.delete({ where: { id: sessionLogId } });
  revalidatePath(`/campaigns/${entry.campaignId}/sessions`);
  return { data: { id: sessionLogId }, error: null };
}
