import { EyeIcon } from "lucide-react";

import { Pokeball } from "@/components/icons/pokeball";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/can";
import { prisma } from "@/lib/prisma";
import type { Region } from "@/lib/generated/prisma/client";

const REGION_LABEL: Record<Region, string> = {
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

const REGION_ORDER: Region[] = [
  "KANTO",
  "JOHTO",
  "HOENN",
  "SINNOH",
  "UNOVA",
  "KALOS",
  "ALOLA",
  "GALAR",
  "PALDEA",
];

export default async function HomePage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [
    totalPokemon,
    seenCount,
    caughtCount,
    pokemonByGroup,
    userCatches,
  ] = await Promise.all([
    prisma.pokemon.count(),
    prisma.userPokemon.count({ where: { userId, seen: true } }),
    prisma.userPokemon.count({ where: { userId, caught: true } }),
    prisma.pokemon.findMany({ select: { id: true, generation: true, region: true } }),
    prisma.userPokemon.findMany({
      where: { userId },
      select: {
        seen: true,
        caught: true,
        pokemon: { select: { generation: true, region: true } },
      },
    }),
  ]);

  const generationTotals = new Map<number, number>();
  const regionTotals = new Map<Region, number>();
  for (const p of pokemonByGroup) {
    generationTotals.set(p.generation, (generationTotals.get(p.generation) ?? 0) + 1);
    regionTotals.set(p.region, (regionTotals.get(p.region) ?? 0) + 1);
  }

  const generationCaught = new Map<number, number>();
  const regionCaught = new Map<Region, number>();
  for (const u of userCatches) {
    if (!u.caught) continue;
    const gen = u.pokemon.generation;
    const region = u.pokemon.region;
    generationCaught.set(gen, (generationCaught.get(gen) ?? 0) + 1);
    regionCaught.set(region, (regionCaught.get(region) ?? 0) + 1);
  }

  const generations = Array.from(generationTotals.keys()).sort((a, b) => a - b);
  const regions = REGION_ORDER.filter((r) => regionTotals.has(r));

  const overallPct = totalPokemon === 0 ? 0 : Math.round((caughtCount / totalPokemon) * 100);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {session.user.name}.
        </h1>
        <p className="text-sm text-muted-foreground">
          Your Pokédex progress at a glance.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                National Dex
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {caughtCount}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  / {totalPokemon} caught
                </span>
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums">{overallPct}%</p>
          </div>
          <ProgressBar value={caughtCount} max={totalPokemon} />
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Pokeball className="size-4" aria-hidden /> {caughtCount} caught
            </span>
            <span className="flex items-center gap-1.5">
              <EyeIcon className="size-4" aria-hidden /> {seenCount} seen
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">By generation</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map((gen) => {
            const total = generationTotals.get(gen) ?? 0;
            const caught = generationCaught.get(gen) ?? 0;
            return (
              <ProgressCard
                key={gen}
                label={`Generation ${gen}`}
                caught={caught}
                total={total}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">By region</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const total = regionTotals.get(region) ?? 0;
            const caught = regionCaught.get(region) ?? 0;
            return (
              <ProgressCard
                key={region}
                label={REGION_LABEL[region]}
                caught={caught}
                total={total}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProgressCard({
  label,
  caught,
  total,
}: {
  label: string;
  caught: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((caught / total) * 100);
  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {caught}/{total}
          </p>
        </div>
        <ProgressBar value={caught} max={total} />
        <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
          {pct}%
        </p>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full bg-primary transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
