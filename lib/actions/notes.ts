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

const CategoryEnum = z.enum([
  "CAMPAIGN",
  "SESSION",
  "NPC",
  "LORE",
  "QUEST",
  "OTHER",
]);

const NoteSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default(""),
  category: CategoryEnum.default("CAMPAIGN"),
  pinned: z.boolean().default(false),
});

export async function createNote(
  characterId: string,
  input: z.infer<typeof NoteSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  const parsed = NoteSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const created = await prisma.note.create({
    data: { characterId, ...parsed.data },
    select: { id: true },
  });
  revalidatePath(`/characters/${characterId}/notes`);
  return { data: created, error: null };
}

export async function updateNote(
  characterId: string,
  noteId: string,
  input: Partial<z.infer<typeof NoteSchema>>,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.note.updateMany({
    where: { id: noteId, characterId },
    data: input,
  });
  revalidatePath(`/characters/${characterId}/notes`);
  return { data: { id: noteId }, error: null };
}

export async function deleteNote(
  characterId: string,
  noteId: string,
): Promise<ActionResult<{ id: string }>> {
  const ownerId = await assertOwner(characterId);
  if (!ownerId) return { data: null, error: "Unauthorized" };
  await prisma.note.deleteMany({ where: { id: noteId, characterId } });
  revalidatePath(`/characters/${characterId}/notes`);
  return { data: { id: noteId }, error: null };
}
