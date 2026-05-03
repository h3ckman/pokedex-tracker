"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  clearActiveCharacterId,
  writeActiveCharacterId,
} from "@/lib/characters/active";
import {
  buildBlankDraft,
  buildQuickDraft,
} from "@/lib/characters/draft-builders";
import type { CharacterDraft } from "@/lib/characters/draft-types";
import { writeCharacterFromDraft } from "@/lib/characters/build";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const PortraitSchema = z
  .string()
  .max(800_000, "Portrait too large")
  .refine(
    (v) => v.startsWith("/portraits/") || v.startsWith("data:image/"),
    "Portrait must be a preset path or image data URL",
  );

const IdentityShape = {
  name: z.string().min(1, "Name required").max(60),
  race: z.string().min(1, "Race required"),
  subrace: z.string().optional(),
  characterClass: z.string().min(1, "Class required"),
  subclass: z.string().optional(),
  background: z.string().min(1, "Background required"),
  alignment: z.string().min(1, "Alignment required"),
  portraitUrl: PortraitSchema.optional(),
};

const BlankSchema = z.object(IdentityShape);

function readIdentityFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    race: formData.get("race"),
    subrace: formData.get("subrace") || undefined,
    characterClass: formData.get("characterClass"),
    subclass: formData.get("subclass") || undefined,
    background: formData.get("background"),
    alignment: formData.get("alignment"),
    portraitUrl: formData.get("portraitUrl") || undefined,
  };
}

async function commitDraft(
  userId: string,
  draft: CharacterDraft,
): Promise<{ id: string }> {
  const result = await writeCharacterFromDraft(userId, draft);
  await writeActiveCharacterId(result.id);
  revalidatePath("/characters");
  revalidatePath("/", "layout");
  return result;
}

export async function createBlankCharacter(
  _prev: { error: string | null } | undefined,
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = BlankSchema.safeParse(readIdentityFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const draft = buildBlankDraft(parsed.data);
  await commitDraft(session.user.id, draft);
  return { error: null };
}

const QuickFormSchema = z.object(IdentityShape);

export async function createQuickCharacter(
  _prev: { error: string | null } | undefined,
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = QuickFormSchema.safeParse(readIdentityFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const draft = buildQuickDraft(parsed.data);
  await commitDraft(session.user.id, draft);
  return { error: null };
}

const StandardSchema: z.ZodType<CharacterDraft> = z.object({
  identity: z.object({
    ...IdentityShape,
    personality: z.string().optional(),
    ideals: z.string().optional(),
    bonds: z.string().optional(),
    flaws: z.string().optional(),
    backstory: z.string().optional(),
    appearance: z.string().optional(),
  }),
  abilities: z.object({
    STR: z.number().int().min(1).max(30),
    DEX: z.number().int().min(1).max(30),
    CON: z.number().int().min(1).max(30),
    INT: z.number().int().min(1).max(30),
    WIS: z.number().int().min(1).max(30),
    CHA: z.number().int().min(1).max(30),
  }),
  skillProficiencies: z.array(z.string()),
  inventory: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().int().positive().optional(),
      type: z.string().optional(),
      rarity: z.string().optional(),
      weight: z.number().nonnegative().optional(),
      description: z.string().optional(),
      equipped: z.boolean().optional(),
      attuned: z.boolean().optional(),
    }),
  ),
  spells: z.array(
    z.object({
      name: z.string().min(1),
      level: z.number().int().min(0).max(9).optional(),
      school: z.string().optional(),
      castingTime: z.string().optional(),
      range: z.string().optional(),
      components: z.string().optional(),
      duration: z.string().optional(),
      description: z.string().optional(),
      prepared: z.boolean().optional(),
      alwaysPrepared: z.boolean().optional(),
    }),
  ),
  features: z.array(
    z.object({
      name: z.string().min(1),
      source: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
}) as z.ZodType<CharacterDraft>;

export async function createStandardCharacter(
  input: CharacterDraft,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  const parsed = StandardSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await commitDraft(session.user.id, parsed.data);
  return { data: result, error: null };
}

export async function createCharacterFromPreset(
  presetId: string,
  overrides?: { name?: string; portraitUrl?: string },
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  const preset = await prisma.characterPreset.findUnique({
    where: { id: presetId },
    select: { payload: true },
  });
  if (!preset) return { data: null, error: "Preset not found" };

  const payload = preset.payload as unknown as CharacterDraft & { version?: number };

  const draft: CharacterDraft = {
    identity: {
      ...payload.identity,
      ...(overrides?.name ? { name: overrides.name } : {}),
      ...(overrides?.portraitUrl !== undefined ? { portraitUrl: overrides.portraitUrl } : {}),
    },
    abilities: payload.abilities,
    skillProficiencies: payload.skillProficiencies,
    inventory: payload.inventory,
    spells: payload.spells,
    features: payload.features,
  };

  const result = await commitDraft(session.user.id, draft);
  return { data: result, error: null };
}

export async function selectCharacter(characterId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  const exists = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
    select: { id: true },
  });
  if (!exists) redirect("/characters");
  await writeActiveCharacterId(characterId);
  revalidatePath("/", "layout");
}

export async function deleteCharacter(
  characterId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  const existing = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { data: null, error: "Character not found" };

  await prisma.character.delete({ where: { id: characterId } });
  await clearActiveCharacterId();
  revalidatePath("/characters");
  revalidatePath("/", "layout");
  return { data: { id: characterId }, error: null };
}

const IdentityUpdateSchema = z.object({
  name: z.string().min(1).max(60),
  race: z.string().min(1),
  subrace: z.string().optional(),
  characterClass: z.string().min(1),
  subclass: z.string().optional(),
  background: z.string().min(1),
  alignment: z.string().min(1),
  personality: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  backstory: z.string().optional(),
  appearance: z.string().optional(),
});

export async function updateCharacterIdentity(
  characterId: string,
  input: z.infer<typeof IdentityUpdateSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  const parsed = IdentityUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const existing = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { data: null, error: "Character not found" };

  await prisma.character.update({
    where: { id: characterId },
    data: parsed.data,
  });
  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/", "layout");
  return { data: { id: characterId }, error: null };
}

export async function updateCharacterPortrait(
  characterId: string,
  portraitUrl: string | null,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { data: null, error: "Unauthorized" };

  if (portraitUrl !== null) {
    const parsed = PortraitSchema.safeParse(portraitUrl);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0]?.message ?? "Invalid portrait",
      };
    }
  }

  const existing = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { data: null, error: "Character not found" };

  await prisma.character.update({
    where: { id: characterId },
    data: { portraitUrl },
  });
  revalidatePath(`/characters/${characterId}`, "layout");
  revalidatePath("/", "layout");
  return { data: { id: characterId }, error: null };
}
