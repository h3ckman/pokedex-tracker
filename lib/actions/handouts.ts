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

const HandoutSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default(""),
});

export async function sendHandout(
  campaignId: string,
  input: {
    title: string;
    body: string;
    recipients: "all" | string[];
  },
): Promise<ActionResult<{ id: string }>> {
  const dm = await assertDm(campaignId);
  if (!dm) return { data: null, error: "Only the DM can send handouts" };
  const parsed = HandoutSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  let recipientUserIds: string[];
  if (input.recipients === "all") {
    const members = await prisma.campaignMembership.findMany({
      where: { campaignId, role: "PLAYER" },
      select: { userId: true },
    });
    recipientUserIds = members.map((m) => m.userId);
  } else {
    const members = await prisma.campaignMembership.findMany({
      where: { campaignId, userId: { in: input.recipients }, role: "PLAYER" },
      select: { userId: true },
    });
    recipientUserIds = members.map((m) => m.userId);
  }

  if (recipientUserIds.length === 0) {
    return { data: null, error: "No valid recipients" };
  }

  const handout = await prisma.handout.create({
    data: {
      campaignId,
      authorUserId: dm.userId,
      title: parsed.data.title,
      body: parsed.data.body,
      recipients: {
        create: recipientUserIds.map((userId) => ({ userId })),
      },
    },
    select: { id: true },
  });

  revalidatePath(`/campaigns/${campaignId}/handouts`);
  revalidatePath("/", "layout");
  return { data: handout, error: null };
}

export async function updateHandout(
  handoutId: string,
  input: { title: string; body: string },
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const handout = await prisma.handout.findUnique({
    where: { id: handoutId },
    select: { authorUserId: true, campaignId: true },
  });
  if (!handout || handout.authorUserId !== session.user.id) {
    return { data: null, error: "Only the author can edit this handout" };
  }
  const parsed = HandoutSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  await prisma.handout.update({
    where: { id: handoutId },
    data: parsed.data,
  });
  revalidatePath(`/campaigns/${handout.campaignId}/handouts`);
  revalidatePath("/", "layout");
  return { data: { id: handoutId }, error: null };
}

export async function deleteHandout(
  handoutId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const handout = await prisma.handout.findUnique({
    where: { id: handoutId },
    select: { authorUserId: true, campaignId: true },
  });
  if (!handout || handout.authorUserId !== session.user.id) {
    return { data: null, error: "Only the author can delete this handout" };
  }
  await prisma.handout.delete({ where: { id: handoutId } });
  revalidatePath(`/campaigns/${handout.campaignId}/handouts`);
  revalidatePath("/", "layout");
  return { data: { id: handoutId }, error: null };
}

export async function togglePinHandout(
  handoutId: string,
): Promise<ActionResult<{ pinned: boolean }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const rec = await prisma.handoutRecipient.findUnique({
    where: {
      handoutId_userId: { handoutId, userId: session.user.id },
    },
  });
  if (!rec) return { data: null, error: "Not a recipient" };
  const pinned = !rec.pinned;
  await prisma.handoutRecipient.update({
    where: { id: rec.id },
    data: { pinned },
  });
  revalidatePath("/", "layout");
  return { data: { pinned }, error: null };
}

export async function markHandoutRead(
  handoutId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  await prisma.handoutRecipient.updateMany({
    where: {
      handoutId,
      userId: session.user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
  return { data: { id: handoutId }, error: null };
}
