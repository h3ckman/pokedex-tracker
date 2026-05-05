"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth/can";

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type CatchStatus = "none" | "seen" | "caught";

const InputSchema = z.object({
  pokemonId: z.string().min(1),
  status: z.enum(["none", "seen", "caught"]),
});

export async function setPokemonStatus(
  pokemonId: string,
  status: CatchStatus,
): Promise<ActionResult<{ pokemonId: string; status: CatchStatus }>> {
  const guard = await authorize("VIEWER");
  if (!guard.data) return { data: null, error: guard.error };
  const { userId } = guard.data;

  const parsed = InputSchema.safeParse({ pokemonId, status });
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const pokemon = await prisma.pokemon.findUnique({
    where: { id: parsed.data.pokemonId },
    select: { nationalDexNumber: true },
  });
  if (!pokemon) return { data: null, error: "Pokemon not found" };

  const now = new Date();

  if (parsed.data.status === "none") {
    await prisma.userPokemon.deleteMany({
      where: { userId, pokemonId: parsed.data.pokemonId },
    });
  } else if (parsed.data.status === "seen") {
    await prisma.userPokemon.upsert({
      where: { userId_pokemonId: { userId, pokemonId: parsed.data.pokemonId } },
      create: {
        userId,
        pokemonId: parsed.data.pokemonId,
        seen: true,
        caught: false,
        seenAt: now,
      },
      update: { seen: true, caught: false, caughtAt: null },
    });
  } else {
    await prisma.userPokemon.upsert({
      where: { userId_pokemonId: { userId, pokemonId: parsed.data.pokemonId } },
      create: {
        userId,
        pokemonId: parsed.data.pokemonId,
        seen: true,
        caught: true,
        seenAt: now,
        caughtAt: now,
      },
      update: { seen: true, caught: true, caughtAt: now },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/pokemon/${pokemon.nationalDexNumber}`);

  return {
    data: { pokemonId: parsed.data.pokemonId, status: parsed.data.status },
    error: null,
  };
}
