import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export async function generateInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${randomSegment(3)}-${randomSegment(3)}`;
    const clash = await prisma.campaign.findUnique({
      where: { inviteCode: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  throw new Error("Could not generate unique invite code");
}
