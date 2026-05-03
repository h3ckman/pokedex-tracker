"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { generateInviteCode } from "@/lib/campaigns/invite";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function requireDmOwnership(
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

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  setting: z.string().max(200).optional(),
  premise: z.string().max(2000).optional(),
});

export async function createCampaign(
  _prev: { error: string | null } | undefined,
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = CreateSchema.safeParse({
    name: formData.get("name"),
    setting: formData.get("setting") || undefined,
    premise: formData.get("premise") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const inviteCode = await generateInviteCode();
  const campaign = await prisma.campaign.create({
    data: {
      ...parsed.data,
      dmUserId: session.user.id,
      inviteCode,
      memberships: {
        create: { userId: session.user.id, role: "DM" },
      },
    },
    select: { id: true },
  });

  revalidatePath("/campaigns");
  revalidatePath("/", "layout");
  redirect(`/campaigns/${campaign.id}`);
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(80),
  setting: z.string().max(200).optional(),
  premise: z.string().max(2000).optional(),
});

export async function updateCampaign(
  campaignId: string,
  input: z.infer<typeof UpdateSchema>,
): Promise<ActionResult<{ id: string }>> {
  const owner = await requireDmOwnership(campaignId);
  if (!owner) return { data: null, error: "Unauthorized" };
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  await prisma.campaign.update({
    where: { id: campaignId },
    data: parsed.data,
  });
  revalidatePath(`/campaigns/${campaignId}`, "layout");
  return { data: { id: campaignId }, error: null };
}

export async function deleteCampaign(
  campaignId: string,
): Promise<ActionResult<{ id: string }>> {
  const owner = await requireDmOwnership(campaignId);
  if (!owner) return { data: null, error: "Unauthorized" };
  await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath("/campaigns");
  revalidatePath("/", "layout");
  return { data: { id: campaignId }, error: null };
}

export async function regenerateInviteCode(
  campaignId: string,
): Promise<ActionResult<{ inviteCode: string }>> {
  const owner = await requireDmOwnership(campaignId);
  if (!owner) return { data: null, error: "Unauthorized" };
  const inviteCode = await generateInviteCode();
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { inviteCode },
  });
  revalidatePath(`/campaigns/${campaignId}/settings`);
  return { data: { inviteCode }, error: null };
}

export async function joinCampaignByCode(
  code: string,
  characterId?: string,
): Promise<ActionResult<{ campaignId: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode: code },
    select: { id: true },
  });
  if (!campaign) return { data: null, error: "Invalid invite code" };

  if (characterId) {
    const ownsCharacter = await prisma.character.findFirst({
      where: { id: characterId, userId: session.user.id },
      select: { id: true },
    });
    if (!ownsCharacter) {
      return { data: null, error: "You don't own that character" };
    }
  }

  await prisma.campaignMembership.upsert({
    where: {
      campaignId_userId: {
        campaignId: campaign.id,
        userId: session.user.id,
      },
    },
    update: characterId ? { characterId } : {},
    create: {
      campaignId: campaign.id,
      userId: session.user.id,
      role: "PLAYER",
      characterId,
    },
  });

  revalidatePath("/campaigns");
  revalidatePath("/", "layout");
  return { data: { campaignId: campaign.id }, error: null };
}

export async function assignMembershipCharacter(
  campaignId: string,
  characterId: string | null,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  if (characterId) {
    const owns = await prisma.character.findFirst({
      where: { id: characterId, userId: session.user.id },
      select: { id: true },
    });
    if (!owns) return { data: null, error: "You don't own that character" };
  }

  await prisma.campaignMembership.update({
    where: {
      campaignId_userId: { campaignId, userId: session.user.id },
    },
    data: { characterId },
  });
  revalidatePath(`/campaigns/${campaignId}`, "layout");
  return { data: { id: campaignId }, error: null };
}

export async function removeMember(
  campaignId: string,
  userId: string,
): Promise<ActionResult<{ id: string }>> {
  const owner = await requireDmOwnership(campaignId);
  if (!owner) return { data: null, error: "Unauthorized" };
  if (owner.userId === userId) {
    return { data: null, error: "DM cannot remove themselves" };
  }
  await prisma.campaignMembership.deleteMany({
    where: { campaignId, userId },
  });
  revalidatePath(`/campaigns/${campaignId}`, "layout");
  return { data: { id: campaignId }, error: null };
}

export async function leaveCampaign(
  campaignId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };
  const m = await prisma.campaignMembership.findUnique({
    where: {
      campaignId_userId: { campaignId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!m) return { data: null, error: "Not a member" };
  if (m.role === "DM") {
    return { data: null, error: "DM cannot leave their own campaign. Delete it instead." };
  }
  await prisma.campaignMembership.delete({
    where: {
      campaignId_userId: { campaignId, userId: session.user.id },
    },
  });
  revalidatePath("/campaigns");
  revalidatePath("/", "layout");
  return { data: { id: campaignId }, error: null };
}
