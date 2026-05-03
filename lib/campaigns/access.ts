import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import type { CampaignRole } from "@/lib/generated/prisma/client";

export async function requireCampaignMember(campaignId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const membership = await prisma.campaignMembership.findUnique({
    where: {
      campaignId_userId: { campaignId, userId: session.user.id },
    },
    include: { campaign: true },
  });
  if (!membership) notFound();
  return {
    campaign: membership.campaign,
    membership,
    userId: session.user.id,
    role: membership.role,
  };
}

export async function requireDm(campaignId: string) {
  const ctx = await requireCampaignMember(campaignId);
  if (ctx.role !== "DM") redirect(`/campaigns/${campaignId}`);
  return ctx;
}

export type CampaignSummary = {
  id: string;
  name: string;
  role: CampaignRole;
  memberCount: number;
  dmName: string;
  updatedAt: Date;
};

export async function listCampaignsForUser(
  userId: string,
): Promise<CampaignSummary[]> {
  const memberships = await prisma.campaignMembership.findMany({
    where: { userId },
    include: {
      campaign: {
        include: {
          dm: { select: { name: true } },
          _count: { select: { memberships: true } },
        },
      },
    },
    orderBy: { campaign: { updatedAt: "desc" } },
  });

  return memberships.map((m) => ({
    id: m.campaignId,
    name: m.campaign.name,
    role: m.role,
    memberCount: m.campaign._count.memberships,
    dmName: m.campaign.dm.name,
    updatedAt: m.campaign.updatedAt,
  }));
}
