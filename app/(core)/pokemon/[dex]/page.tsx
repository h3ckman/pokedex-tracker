import {
  BookOpenIcon,
  ChevronDownIcon,
  MapPinIcon,
  RulerIcon,
  WeightIcon,
  ZapIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { GameSystem } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { EvolutionaryChain } from "./_components/evolutionary-chain";
import { SpeciesCard } from "./_components/species-card";
import { SpriteToggle } from "./_components/sprite-toggle";
import { StatBars } from "./_components/stat-bars";
import { TypeBadge } from "./_components/type-badge";
import { TypeMatchups } from "./_components/type-matchups";

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
  });
  if (!pokemon) notFound();

  const [entries, chainMembers] = await Promise.all([
    prisma.pokedexEntry.findMany({
      where: { pokemonId: pokemon.id },
      orderBy: [{ gameSystem: "asc" }, { gameTitle: "asc" }],
    }),
    pokemon.evolutionChainRootDex != null
      ? prisma.pokemon.findMany({
          where: { evolutionChainRootDex: pokemon.evolutionChainRootDex },
          select: {
            nationalDexNumber: true,
            name: true,
            spriteUrl: true,
            evolvesFromDexNumber: true,
            evolutionTriggerLabel: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const entriesBySystem = new Map<GameSystem, typeof entries>();
  for (const e of entries) {
    const list = entriesBySystem.get(e.gameSystem) ?? [];
    list.push(e);
    entriesBySystem.set(e.gameSystem, list);
  }
  const orderedSystems = SYSTEM_ORDER.filter((s) => entriesBySystem.has(s));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
        <SpriteToggle
          defaultUrl={pokemon.artworkUrl}
          shinyUrl={pokemon.shinyArtworkUrl}
          animatedUrl={pokemon.animatedSpriteUrl}
          spriteUrl={pokemon.spriteUrl}
          alt={pokemon.name}
        />
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
        <StatCard
          icon={<RulerIcon className="size-4" aria-hidden />}
          label="Height"
          value={formatHeight(pokemon.height)}
        />
        <StatCard
          icon={<WeightIcon className="size-4" aria-hidden />}
          label="Weight"
          value={formatWeight(pokemon.weight)}
        />
        <StatCard
          icon={<MapPinIcon className="size-4" aria-hidden />}
          label="Generation"
          value={`Gen ${pokemon.generation}`}
          sub={REGION_LABEL[pokemon.region] ?? pokemon.region}
        />
        <StatCard
          icon={<ZapIcon className="size-4" aria-hidden />}
          label="Abilities"
          value={pokemon.abilities[0] ?? "—"}
          sub={pokemon.abilities.slice(1).join(" · ") || undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatBars
          hp={pokemon.hp}
          attack={pokemon.attack}
          defense={pokemon.defense}
          specialAttack={pokemon.specialAttack}
          specialDefense={pokemon.specialDefense}
          speed={pokemon.speed}
          evHp={pokemon.evHp}
          evAttack={pokemon.evAttack}
          evDefense={pokemon.evDefense}
          evSpecialAttack={pokemon.evSpecialAttack}
          evSpecialDefense={pokemon.evSpecialDefense}
          evSpeed={pokemon.evSpeed}
        />
        <TypeMatchups
          weaknesses4x={pokemon.weaknesses4x}
          weaknesses2x={pokemon.weaknesses2x}
          resistances1_2={pokemon.resistances1_2}
          resistances1_4={pokemon.resistances1_4}
          immunities={pokemon.immunities}
        />
      </div>

      <SpeciesCard pokemon={pokemon} />

      <EvolutionaryChain
        members={chainMembers}
        currentDexNumber={pokemon.nationalDexNumber}
      />

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BookOpenIcon className="size-5 text-muted-foreground" aria-hidden />
            Pokédex entries
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {entries.length} entries across {orderedSystems.length} systems
          </span>
        </div>

        {orderedSystems.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No Pokédex entries on record.
            </CardContent>
          </Card>
        ) : (
          orderedSystems.map((system, index) => {
            const entries = entriesBySystem.get(system) ?? [];
            return (
              <Card key={system}>
                <Collapsible defaultOpen={index === 0}>
                  <CollapsibleTrigger
                    render={
                      <button
                        type="button"
                        className="group/entries flex w-full items-center gap-2 text-left"
                      >
                        <CardHeader className="flex-1">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span>{SYSTEM_LABEL[system]}</span>
                            <span className="text-xs font-normal text-muted-foreground tabular-nums">
                              {entries.length}{" "}
                              {entries.length === 1 ? "game" : "games"}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <ChevronDownIcon
                          className="mr-6 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[panel-open]/entries:rotate-180"
                          aria-hidden
                        />
                      </button>
                    }
                  />
                  <CollapsibleContent>
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
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {icon}
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
