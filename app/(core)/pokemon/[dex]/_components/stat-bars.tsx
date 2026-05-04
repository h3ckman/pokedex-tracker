import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_STAT = 255;

const STAT_FILL: Record<string, string> = {
  HP: "bg-emerald-500",
  Attack: "bg-orange-500",
  Defense: "bg-yellow-500",
  "Sp. Atk": "bg-blue-500",
  "Sp. Def": "bg-indigo-500",
  Speed: "bg-pink-500",
};

type Stat = { label: string; value: number | null };

export function StatBars({
  hp,
  attack,
  defense,
  specialAttack,
  specialDefense,
  speed,
}: {
  hp: number | null;
  attack: number | null;
  defense: number | null;
  specialAttack: number | null;
  specialDefense: number | null;
  speed: number | null;
}) {
  const stats: Stat[] = [
    { label: "HP", value: hp },
    { label: "Attack", value: attack },
    { label: "Defense", value: defense },
    { label: "Sp. Atk", value: specialAttack },
    { label: "Sp. Def", value: specialDefense },
    { label: "Speed", value: speed },
  ];

  const total = stats.reduce((sum, s) => sum + (s.value ?? 0), 0);
  const hasAny = stats.some((s) => s.value !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between text-base">
          <span>Base stats</span>
          {hasAny && (
            <span className="text-xs font-normal text-muted-foreground tabular-nums">
              Total {total}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-sm text-muted-foreground">No stats recorded.</p>
        ) : (
          <ul className="grid gap-3">
            {stats.map((s) => {
              const value = s.value ?? 0;
              const pct = Math.min(100, (value / MAX_STAT) * 100);
              return (
                <li
                  key={s.label}
                  className="grid grid-cols-[5rem_3rem_1fr] items-center gap-3"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {s.value ?? "—"}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        STAT_FILL[s.label] ?? "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                      aria-hidden
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
