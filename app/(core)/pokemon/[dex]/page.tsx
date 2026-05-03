import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pokeball } from "@/components/icons/pokeball";
import { prisma } from "@/lib/prisma";

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

const REGION_LABEL: Record<string, string> = {
  KANTO: "Kanto",
  JOHTO: "Johto",
  HOENN: "Hoenn",
  SINNOH: "Sinnoh",
  UNOVA: "Unova",
  KALOS: "Kalos",
  ALOLA: "Alola",
  GALAR: "Galar",
  PALDEA: "Paldea",
};

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ dex: string }>;
}) {
  const { dex } = await params;
  const dexNumber = Number(dex);
  if (!Number.isInteger(dexNumber) || dexNumber < 1) notFound();

  const pokemon = await prisma.pokemon.findUnique({
    where: { nationalDexNumber: dexNumber },
    include: {
      entries: {
        orderBy: [{ gameSystem: "asc" }, { gameTitle: "asc" }],
      },
    },
  });
  if (!pokemon) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        {pokemon.spriteUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pokemon.spriteUrl}
            alt={pokemon.name}
            className="size-24 shrink-0"
          />
        ) : (
          <Pokeball className="size-24 shrink-0" />
        )}
        <div>
          <p className="font-mono text-sm text-muted-foreground tabular-nums">
            #{pad4(pokemon.nationalDexNumber)}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{pokemon.name}</h1>
          <p className="text-sm text-muted-foreground">
            Generation {pokemon.generation} ·{" "}
            {REGION_LABEL[pokemon.region] ?? pokemon.region}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pokédex entries</CardTitle>
        </CardHeader>
        <CardContent>
          {pokemon.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No entries recorded.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {pokemon.entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-baseline justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{e.gameTitle}</span>
                  <span className="text-xs text-muted-foreground">
                    {e.regionName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
