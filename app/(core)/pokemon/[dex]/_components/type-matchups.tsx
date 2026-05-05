import { ShieldIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PokemonType } from "@/lib/generated/prisma/client";

import { TypeBadge } from "./type-badge";

type Row = {
  label: string;
  types: PokemonType[];
  tone: string;
};

export function TypeMatchups({
  weaknesses4x,
  weaknesses2x,
  resistances1_2,
  resistances1_4,
  immunities,
}: {
  weaknesses4x: PokemonType[];
  weaknesses2x: PokemonType[];
  resistances1_2: PokemonType[];
  resistances1_4: PokemonType[];
  immunities: PokemonType[];
}) {
  const rows: Row[] = [
    { label: "4×", types: weaknesses4x, tone: "text-red-600 dark:text-red-400" },
    { label: "2×", types: weaknesses2x, tone: "text-orange-600 dark:text-orange-400" },
    { label: "½×", types: resistances1_2, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "¼×", types: resistances1_4, tone: "text-emerald-700 dark:text-emerald-300" },
    { label: "0×", types: immunities, tone: "text-muted-foreground" },
  ].filter((r) => r.types.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between text-base">
          <span className="flex items-center gap-2">
            <ShieldIcon className="size-4 text-muted-foreground" aria-hidden />
            Damage taken
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            vs. attacking type
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matchup data available.
          </p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-[3rem_1fr] items-start gap-3"
              >
                <span
                  className={`pt-1 text-sm font-bold tabular-nums ${row.tone}`}
                >
                  {row.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {row.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
