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

const ItemTypeEnum = z.enum([
  "WEAPON",
  "ARMOR",
  "SHIELD",
  "TOOL",
  "CONSUMABLE",
  "TREASURE",
  "MISC",
]);
const RarityEnum = z.enum([
  "COMMON",
  "UNCOMMON",
  "RARE",
  "VERY_RARE",
  "LEGENDARY",
  "ARTIFACT",
]);

const ItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(9999).default(1),
  weight: z.number().min(0).max(9999).default(0),
  type: ItemTypeEnum.default("MISC"),
  rarity: RarityEnum.default("COMMON"),
  description: z.string().optional(),
  equipped: z.boolean().default(false),
  attuned: z.boolean().default(false),
});

export async function addInventoryItem(
  characterId: string,
  input: z.infer<typeof ItemSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = ItemSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const created = await prisma.inventoryItem.create({
    data: { characterId, ...parsed.data },
    select: { id: true },
  });
  revalidatePath(`/characters/${characterId}/inventory`);
  return { data: created, error: null };
}

export async function updateInventoryItem(
  characterId: string,
  itemId: string,
  input: Partial<z.infer<typeof ItemSchema>>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.inventoryItem.updateMany({
    where: { id: itemId, characterId },
    data: input,
  });
  revalidatePath(`/characters/${characterId}/inventory`);
  return { data: { id: itemId }, error: null };
}

export async function deleteInventoryItem(
  characterId: string,
  itemId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.inventoryItem.deleteMany({
    where: { id: itemId, characterId },
  });
  revalidatePath(`/characters/${characterId}/inventory`);
  return { data: { id: itemId }, error: null };
}

const CurrencySchema = z.object({
  copper: z.number().int().min(0),
  silver: z.number().int().min(0),
  electrum: z.number().int().min(0),
  gold: z.number().int().min(0),
  platinum: z.number().int().min(0),
});

export async function updateCurrency(
  characterId: string,
  input: z.infer<typeof CurrencySchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = CurrencySchema.safeParse(input);
  if (!parsed.success) return { data: null, error: "Invalid currency" };
  await prisma.character.update({
    where: { id: characterId },
    data: parsed.data,
  });
  revalidatePath(`/characters/${characterId}/inventory`);
  return { data: { id: characterId }, error: null };
}
