"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function assertOwner(characterId: string): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const c = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
    select: { id: true },
  });
  return c ? session.user.id : null;
}

const FeatureSchema = z.object({
  name: z.string().min(1).max(100),
  source: z.string().min(1).max(100),
  description: z.string().max(4000).default(""),
});

export async function addFeature(
  characterId: string,
  input: z.infer<typeof FeatureSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = FeatureSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const created = await prisma.feature.create({
    data: { characterId, ...parsed.data },
    select: { id: true },
  });
  revalidatePath(`/characters/${characterId}/features`);
  return { data: created, error: null };
}

export async function updateFeature(
  characterId: string,
  featureId: string,
  input: Partial<z.infer<typeof FeatureSchema>>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.feature.updateMany({
    where: { id: featureId, characterId },
    data: input,
  });
  revalidatePath(`/characters/${characterId}/features`);
  return { data: { id: featureId }, error: null };
}

export async function deleteFeature(
  characterId: string,
  featureId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.feature.deleteMany({ where: { id: featureId, characterId } });
  revalidatePath(`/characters/${characterId}/features`);
  return { data: { id: featureId }, error: null };
}
