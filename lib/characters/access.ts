import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { abilityModifier } from "@/lib/dnd/abilities";

export async function requireCharacter(characterId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId: session.user.id },
  });
  if (!character) notFound();
  return { character, userId: session.user.id };
}

export async function listCharactersForUser(userId: string) {
  const characters = await prisma.character.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      race: true,
      characterClass: true,
      level: true,
      portraitUrl: true,
      updatedAt: true,
      currentHp: true,
      maxHp: true,
      tempHp: true,
      armorClass: true,
      gold: true,
      speed: true,
      abilities: {
        where: { ability: "DEX" },
        select: { score: true },
      },
    },
  });
  return characters.map(({ abilities, ...c }) => ({
    ...c,
    initiative: abilityModifier(abilities[0]?.score ?? 10),
  }));
}
