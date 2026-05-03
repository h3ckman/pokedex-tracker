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

const SchoolEnum = z.enum([
  "ABJURATION",
  "CONJURATION",
  "DIVINATION",
  "ENCHANTMENT",
  "EVOCATION",
  "ILLUSION",
  "NECROMANCY",
  "TRANSMUTATION",
]);

const SpellSchema = z.object({
  name: z.string().min(1).max(80),
  level: z.number().int().min(0).max(9),
  school: SchoolEnum,
  castingTime: z.string().min(1).max(60).default("1 action"),
  range: z.string().min(1).max(60).default("Self"),
  components: z.string().min(0).max(200).default(""),
  duration: z.string().min(1).max(60).default("Instantaneous"),
  description: z.string().max(4000).default(""),
  prepared: z.boolean().default(false),
  alwaysPrepared: z.boolean().default(false),
});

export async function addSpell(
  characterId: string,
  input: z.infer<typeof SpellSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = SpellSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const created = await prisma.spell.create({
    data: { characterId, ...parsed.data },
    select: { id: true },
  });
  revalidatePath(`/characters/${characterId}/spells`);
  return { data: created, error: null };
}

export async function toggleSpellPrepared(
  characterId: string,
  spellId: string,
  prepared: boolean,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.spell.updateMany({
    where: { id: spellId, characterId },
    data: { prepared },
  });
  revalidatePath(`/characters/${characterId}/spells`);
  return { data: { id: spellId }, error: null };
}

export async function deleteSpell(
  characterId: string,
  spellId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.spell.deleteMany({ where: { id: spellId, characterId } });
  revalidatePath(`/characters/${characterId}/spells`);
  return { data: { id: spellId }, error: null };
}

export async function adjustSlot(
  characterId: string,
  level: number,
  delta: number,
): Promise<ActionResult<{ used: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  if (level < 1 || level > 9) return { data: null, error: "Invalid level" };

  const usedKey = `slot${level}Used` as const;
  const maxKey = `slot${level}Max` as const;

  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: { [usedKey]: true, [maxKey]: true } as Record<string, true>,
  });
  if (!c) return { data: null, error: "Not found" };

  const used = (c as unknown as Record<string, number>)[usedKey];
  const max = (c as unknown as Record<string, number>)[maxKey];
  const next = Math.max(0, Math.min(max, used + delta));

  await prisma.character.update({
    where: { id: characterId },
    data: { [usedKey]: next },
  });
  revalidatePath(`/characters/${characterId}/spells`);
  return { data: { used: next }, error: null };
}

const SlotsSchema = z.object({
  slot1Max: z.number().int().min(0).max(99),
  slot2Max: z.number().int().min(0).max(99),
  slot3Max: z.number().int().min(0).max(99),
  slot4Max: z.number().int().min(0).max(99),
  slot5Max: z.number().int().min(0).max(99),
  slot6Max: z.number().int().min(0).max(99),
  slot7Max: z.number().int().min(0).max(99),
  slot8Max: z.number().int().min(0).max(99),
  slot9Max: z.number().int().min(0).max(99),
});

export async function updateSlotMaxes(
  characterId: string,
  input: z.infer<typeof SlotsSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = SlotsSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: "Invalid slots" };
  await prisma.character.update({
    where: { id: characterId },
    data: parsed.data,
  });
  revalidatePath(`/characters/${characterId}/spells`);
  return { data: { id: characterId }, error: null };
}
