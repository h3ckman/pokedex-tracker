import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pokeball } from "@/components/icons/pokeball";
import type { GameSystem } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { TypeBadge } from "./_components/type-badge";

const TOTAL_POKEMON = 1000;

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

const SYSTEM_ORDER: GameSystem[] = [
  "GAME_BOY",
  "GAME_BOY_COLOR",
  "GAME_BOY_ADVANCE",
  "NINTENDO_DS",
  "NINTENDO_3DS",
  "NINTENDO_SWITCH",
];

const SYSTEM_LABEL: Record<GameSystem, string> = {
  GAME_BOY: "Game Boy",
  GAME_BOY_COLOR: "Game Boy Color",
  GAME_BOY_ADVANCE: "Game Boy Advance",
  NINTENDO_DS: "Nintendo DS",
  NINTENDO_3DS: "Nintendo 3DS",
  NINTENDO_SWITCH: "Nintendo Switch",
};

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function formatHeight(decimeters: number | null): string {
  if (decimeters === null) return "—";
  const meters = decimeters / 10;
  return `${meters.toFixed(1)} m`;
}

function formatWeight(hectograms: number | null): string {
  if (hectograms === null) return "—";
  const kilograms = hectograms / 10;
  return `${kilograms.toFixed(1)} kg`;
}

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

  const entriesBySystem = new Map<GameSystem, typeof pokemon.entries>();
  for (const e of pokemon.entries) {
    const list = entriesBySystem.get(e.gameSystem) ?? [];
    list.push(e);
    entriesBySystem.set(e.gameSystem, list);
  }
  const orderedSystems = SYSTEM_ORDER.filter((s) => entriesBySystem.has(s));

  const prevDex = dexNumber > 1 ? dexNumber - 1 : null;
  const nextDex = dexNumber < TOTAL_POKEMON ? dexNumber + 1 : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <nav className="flex items-center justify-between text-sm">
        {prevDex ? (
          <Button variant="ghost" size="sm" render={<Link href={`/pokemon/${prevDex}`} />}>
            <ChevronLeftIcon />
            <span className="tabular-nums">#{pad4(prevDex)}</span>
          </Button>
        ) : (
          <span />
        )}
        {nextDex ? (
          <Button variant="ghost" size="sm" render={<Link href={`/pokemon/${nextDex}`} />}>
            <span className="tabular-nums">#{pad4(nextDex)}</span>
            <ChevronRightIcon />
          </Button>
        ) : (
          <span />
        )}
      </nav>

      <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
        <div className="relative flex size-48 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border sm:size-56">
          {pokemon.artworkUrl || pokemon.spriteUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pokemon.artworkUrl ?? pokemon.spriteUrl ?? ""}
              alt={pokemon.name}
              className="size-44 object-contain sm:size-52"
            />
          ) : (
            <Pokeball className="size-32" />
          )}
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <p className="font-mono text-sm text-muted-foreground tabular-nums">
            #{pad4(pokemon.nationalDexNumber)}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{pokemon.name}</h1>
          {pokemon.genus && (
            <p className="text-sm text-muted-foreground">{pokemon.genus}</p>
          )}
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Height" value={formatHeight(pokemon.height)} />
        <StatCard label="Weight" value={formatWeight(pokemon.weight)} />
        <StatCard
          label="Generation"
          value={`Gen ${pokemon.generation}`}
          sub={REGION_LABEL[pokemon.region] ?? pokemon.region}
        />
        <StatCard
          label="Abilities"
          value={pokemon.abilities[0] ?? "—"}
          sub={pokemon.abilities.slice(1).join(" · ") || undefined}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Pokédex entries
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {pokemon.entries.length} entries across {orderedSystems.length}{" "}
            systems
          </span>
        </div>

        {orderedSystems.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No Pokédex entries on record.
            </CardContent>
          </Card>
        ) : (
          orderedSystems.map((system) => {
            const entries = entriesBySystem.get(system) ?? [];
            return (
              <Card key={system}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{SYSTEM_LABEL[system]}</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {entries.length}{" "}
                      {entries.length === 1 ? "game" : "games"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-md border bg-background p-3"
                    >
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {e.gameTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {e.regionName}
                        </span>
                      </div>
                      {e.flavorText ? (
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {e.flavorText}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          No entry recorded.
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
        {sub && (
          <p className="text-xs text-muted-foreground truncate" title={sub}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
