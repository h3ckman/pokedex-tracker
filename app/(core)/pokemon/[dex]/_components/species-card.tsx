import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Pokemon = {
  captureRate: number | null;
  baseHappiness: number | null;
  growthRate: string | null;
  eggGroups: string[];
  genderRate: number | null;
  hatchCounter: number | null;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  habitat: string | null;
  shape: string | null;
  dexColor: string | null;
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function GenderBar({ genderRate }: { genderRate: number }) {
  if (genderRate === -1) {
    return <span className="text-sm text-muted-foreground">Genderless</span>;
  }
  const femalePct = (genderRate / 8) * 100;
  const malePct = 100 - femalePct;
  return (
    <div className="space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {malePct > 0 && (
          <div
            className="h-full bg-sky-500"
            style={{ width: `${malePct}%` }}
            aria-hidden
          />
        )}
        {femalePct > 0 && (
          <div
            className="h-full bg-pink-500"
            style={{ width: `${femalePct}%` }}
            aria-hidden
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        ♂ {malePct.toFixed(0)}% · ♀ {femalePct.toFixed(0)}%
      </p>
    </div>
  );
}

function CaptureRate({ rate }: { rate: number }) {
  const pct = (rate / 255) * 100;
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold tabular-nums">
        {rate}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          / 255 ({pct.toFixed(0)}%)
        </span>
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-amber-500"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function SpeciesCard({ pokemon }: { pokemon: Pokemon }) {
  const hasAny =
    pokemon.captureRate !== null ||
    pokemon.baseHappiness !== null ||
    pokemon.growthRate !== null ||
    pokemon.eggGroups.length > 0 ||
    pokemon.genderRate !== null ||
    pokemon.hatchCounter !== null ||
    pokemon.habitat !== null ||
    pokemon.shape !== null ||
    pokemon.dexColor !== null;

  if (!hasAny && !pokemon.isLegendary && !pokemon.isMythical && !pokemon.isBaby) {
    return null;
  }

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <CardHeader className="flex-1">
                <CardTitle className="text-base">Species data</CardTitle>
              </CardHeader>
              <ChevronDownIcon
                className="mr-6 size-4 text-muted-foreground transition-transform duration-150 group-data-[panel-open]:rotate-180"
                aria-hidden
              />
            </button>
          }
        />
        <CollapsibleContent>
          <CardContent className="space-y-5">
            {(pokemon.isLegendary || pokemon.isMythical || pokemon.isBaby) && (
              <div className="flex flex-wrap gap-2">
                {pokemon.isLegendary && (
                  <Badge className="bg-amber-500 text-amber-50">
                    Legendary
                  </Badge>
                )}
                {pokemon.isMythical && (
                  <Badge className="bg-fuchsia-500 text-fuchsia-50">
                    Mythical
                  </Badge>
                )}
                {pokemon.isBaby && (
                  <Badge className="bg-sky-400 text-sky-950">Baby</Badge>
                )}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {pokemon.captureRate !== null && (
                <Field label="Capture rate">
                  <CaptureRate rate={pokemon.captureRate} />
                </Field>
              )}
              {pokemon.genderRate !== null && (
                <Field label="Gender ratio">
                  <GenderBar genderRate={pokemon.genderRate} />
                </Field>
              )}
              {pokemon.baseHappiness !== null && (
                <Field label="Base friendship">
                  <span className="font-semibold tabular-nums">
                    {pokemon.baseHappiness}
                  </span>
                </Field>
              )}
              {pokemon.hatchCounter !== null && (
                <Field label="Hatch cycles">
                  <span className="font-semibold tabular-nums">
                    {pokemon.hatchCounter}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ≈ {pokemon.hatchCounter * 257} steps
                    </span>
                  </span>
                </Field>
              )}
              {pokemon.growthRate && (
                <Field label="Growth rate">
                  <span className="font-medium">
                    {titleCase(pokemon.growthRate)}
                  </span>
                </Field>
              )}
              {pokemon.eggGroups.length > 0 && (
                <Field label="Egg groups">
                  <div className="flex flex-wrap gap-1.5">
                    {pokemon.eggGroups.map((g) => (
                      <Badge key={g} variant="secondary">
                        {titleCase(g)}
                      </Badge>
                    ))}
                  </div>
                </Field>
              )}
              {pokemon.habitat && (
                <Field label="Habitat">{titleCase(pokemon.habitat)}</Field>
              )}
              {pokemon.shape && (
                <Field label="Shape">{titleCase(pokemon.shape)}</Field>
              )}
              {pokemon.dexColor && (
                <Field label="Dex color">{titleCase(pokemon.dexColor)}</Field>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
