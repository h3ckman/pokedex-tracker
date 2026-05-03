import "server-only";
import { prisma } from "@/lib/prisma";

export async function listCharacterPresets(filterClass?: string) {
  return prisma.characterPreset.findMany({
    where: filterClass ? { characterClass: filterClass } : undefined,
    orderBy: [{ characterClass: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      archetype: true,
      characterClass: true,
      subclass: true,
      race: true,
      subrace: true,
      background: true,
      alignment: true,
      summary: true,
      portraitUrl: true,
    },
  });
}

export async function getCharacterPreset(slug: string) {
  return prisma.characterPreset.findUnique({
    where: { slug },
  });
}
