"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getClass, spellSlotsForLevel } from "@/lib/dnd";
import type {
  AbilityName,
  SkillName,
} from "@/lib/generated/prisma/client";

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

const AbilitySchema = z.object({
  ability: z.enum(["STR", "DEX", "CON", "INT", "WIS", "CHA"]),
  score: z.number().int().min(1).max(30),
});

export async function updateAbilityScore(
  characterId: string,
  input: z.infer<typeof AbilitySchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = AbilitySchema.safeParse(input);
  if (!parsed.success) return { data: null, error: "Invalid input" };

  await prisma.abilityScore.upsert({
    where: {
      characterId_ability: { characterId, ability: parsed.data.ability },
    },
    update: { score: parsed.data.score },
    create: {
      characterId,
      ability: parsed.data.ability,
      score: parsed.data.score,
    },
  });

  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: characterId }, error: null };
}

export async function toggleSavingThrow(
  characterId: string,
  ability: AbilityName,
  proficient: boolean,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.savingThrow.upsert({
    where: { characterId_ability: { characterId, ability } },
    update: { proficient },
    create: { characterId, ability, proficient },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: characterId }, error: null };
}

export async function updateSkillProficiency(
  characterId: string,
  skill: SkillName,
  proficient: boolean,
  expertise: boolean,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.skillProficiency.upsert({
    where: { characterId_skill: { characterId, skill } },
    update: { proficient, expertise: expertise && proficient },
    create: {
      characterId,
      skill,
      proficient,
      expertise: expertise && proficient,
    },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: characterId }, error: null };
}

const CombatSchema = z.object({
  armorClass: z.number().int().min(0).max(40),
  maxHp: z.number().int().min(1).max(999),
  tempHp: z.number().int().min(0).max(999),
  hitDieType: z.number().int().min(2).max(20),
  speed: z.number().int().min(0).max(500),
});

export async function updateCombatStats(
  characterId: string,
  input: z.infer<typeof CombatSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = CombatSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const existing = await prisma.character.findUnique({
    where: { id: characterId },
    select: { currentHp: true, maxHp: true },
  });
  const currentHp = Math.min(
    existing?.currentHp ?? parsed.data.maxHp,
    parsed.data.maxHp,
  );
  await prisma.character.update({
    where: { id: characterId },
    data: { ...parsed.data, currentHp },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: characterId }, error: null };
}

export async function adjustHp(
  characterId: string,
  delta: number,
): Promise<ActionResult<{ currentHp: number; tempHp: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: { currentHp: true, tempHp: true, maxHp: true },
  });
  if (!c) return { data: null, error: "Character not found" };

  let { currentHp, tempHp } = c;
  if (delta < 0) {
    let remaining = -delta;
    const tempAbsorb = Math.min(tempHp, remaining);
    tempHp -= tempAbsorb;
    remaining -= tempAbsorb;
    currentHp = Math.max(0, currentHp - remaining);
  } else {
    currentHp = Math.min(c.maxHp, currentHp + delta);
  }

  await prisma.character.update({
    where: { id: characterId },
    data: { currentHp, tempHp },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { currentHp, tempHp }, error: null };
}

export async function setTempHp(
  characterId: string,
  tempHp: number,
): Promise<ActionResult<{ tempHp: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const value = Math.max(0, Math.min(999, Math.floor(tempHp)));
  await prisma.character.update({
    where: { id: characterId },
    data: { tempHp: value },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { tempHp: value }, error: null };
}

export async function toggleInspiration(
  characterId: string,
): Promise<ActionResult<{ inspiration: boolean }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: { inspiration: true },
  });
  if (!c) return { data: null, error: "Not found" };
  const inspiration = !c.inspiration;
  await prisma.character.update({
    where: { id: characterId },
    data: { inspiration },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { inspiration }, error: null };
}

export async function updateExperience(
  characterId: string,
  experience: number,
): Promise<ActionResult<{ experience: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const xp = Math.max(0, Math.floor(experience));
  await prisma.character.update({
    where: { id: characterId },
    data: { experience: xp },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { experience: xp }, error: null };
}

export async function shortRest(
  characterId: string,
  hitDiceSpent: number,
  rollTotal: number,
): Promise<ActionResult<{ currentHp: number; hitDiceUsed: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };

  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      currentHp: true,
      maxHp: true,
      hitDiceTotal: true,
      hitDiceUsed: true,
      slot1Max: true,
      slot2Max: true,
      slot3Max: true,
      slot4Max: true,
      slot5Max: true,
      slot6Max: true,
      slot7Max: true,
      slot8Max: true,
      slot9Max: true,
      characterClass: true,
    },
  });
  if (!c) return { data: null, error: "Not found" };

  const dice = Math.max(
    0,
    Math.min(hitDiceSpent, c.hitDiceTotal - c.hitDiceUsed),
  );
  const healed = Math.max(0, Math.floor(rollTotal));
  const currentHp = Math.min(c.maxHp, c.currentHp + healed);
  const hitDiceUsed = c.hitDiceUsed + dice;

  const warlockReset =
    c.characterClass === "Warlock"
      ? {
          slot1Used: 0,
          slot2Used: 0,
          slot3Used: 0,
          slot4Used: 0,
          slot5Used: 0,
        }
      : {};

  await prisma.character.update({
    where: { id: characterId },
    data: { currentHp, hitDiceUsed, ...warlockReset },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { currentHp, hitDiceUsed }, error: null };
}

export async function longRest(
  characterId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: { maxHp: true, hitDiceTotal: true, hitDiceUsed: true },
  });
  if (!c) return { data: null, error: "Not found" };

  const recoveredDice = Math.ceil(c.hitDiceTotal / 2);
  const hitDiceUsed = Math.max(0, c.hitDiceUsed - recoveredDice);

  await prisma.character.update({
    where: { id: characterId },
    data: {
      currentHp: c.maxHp,
      tempHp: 0,
      hitDiceUsed,
      slot1Used: 0,
      slot2Used: 0,
      slot3Used: 0,
      slot4Used: 0,
      slot5Used: 0,
      slot6Used: 0,
      slot7Used: 0,
      slot8Used: 0,
      slot9Used: 0,
    },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { id: characterId }, error: null };
}

const LevelUpSchema = z.object({
  hpGain: z.number().int().min(1).max(30),
});

export async function levelUp(
  characterId: string,
  input: z.infer<typeof LevelUpSchema>,
): Promise<ActionResult<{ level: number }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = LevelUpSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const c = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      level: true,
      maxHp: true,
      hitDiceTotal: true,
      characterClass: true,
    },
  });
  if (!c) return { data: null, error: "Not found" };
  if (c.level >= 20) return { data: null, error: "Already level 20" };

  const newLevel = c.level + 1;
  const classDef = getClass(c.characterClass);
  const slots = spellSlotsForLevel(classDef?.caster ?? "none", newLevel);

  await prisma.character.update({
    where: { id: characterId },
    data: {
      level: newLevel,
      hitDiceTotal: c.hitDiceTotal + 1,
      maxHp: c.maxHp + parsed.data.hpGain,
      currentHp: { increment: parsed.data.hpGain },
      slot1Max: slots[0],
      slot2Max: slots[1],
      slot3Max: slots[2],
      slot4Max: slots[3],
      slot5Max: slots[4],
      slot6Max: slots[5],
      slot7Max: slots[6],
      slot8Max: slots[7],
      slot9Max: slots[8],
    },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  return { data: { level: newLevel }, error: null };
}

