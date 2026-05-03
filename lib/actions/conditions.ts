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

const ConditionSchema = z.object({
  name: z.string().min(1).max(40),
  level: z.number().int().min(1).max(6).default(1),
  note: z.string().optional(),
});

export async function addCondition(
  characterId: string,
  input: z.infer<typeof ConditionSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = ConditionSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: "Invalid input" };

  const existing = await prisma.condition.findFirst({
    where: { characterId, name: parsed.data.name },
  });
  if (existing) {
    await prisma.condition.update({
      where: { id: existing.id },
      data: { level: parsed.data.level, note: parsed.data.note },
    });
    revalidatePath(`/characters/${characterId}`, "layout");
    return { data: { id: existing.id }, error: null };
  }

  const created = await prisma.condition.create({
    data: {
      characterId,
      name: parsed.data.name,
      level: parsed.data.level,
      note: parsed.data.note,
    },
    select: { id: true },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: created, error: null };
}

export async function removeCondition(
  characterId: string,
  conditionId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.condition.deleteMany({
    where: { id: conditionId, characterId },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: conditionId }, error: null };
}
