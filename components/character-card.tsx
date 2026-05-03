import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  CoinsIcon,
  FootprintsIcon,
  HeartIcon,
  ShieldIcon,
  ZapIcon,
} from "lucide-react";
import { format } from "date-fns";
import { formatModifier } from "@/lib/dnd/abilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CharacterCardData = {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  portraitUrl: string | null;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  armorClass: number;
  gold: number;
  speed: number;
  initiative: number;
  updatedAt?: Date;
};

type CharacterCardProps = {
  character?: CharacterCardData | null;
  fallbackName?: string;
  fallbackLabel?: string;
  header?: ReactNode;
  actions?: ReactNode;
  href?: string;
  isActive?: boolean;
};

export function CharacterCard({
  character,
  fallbackName,
  fallbackLabel = "No character assigned",
  header,
  actions,
  href,
  isActive,
}: CharacterCardProps) {
  const displayName = character?.name ?? fallbackName ?? "Unknown";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const card = (
    <Card
      role="listitem"
      className={cn(
        "h-full transition-all",
        href && "hover:shadow-md hover:ring-foreground/20",
        isActive && "ring-2 ring-emerald-500/50",
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-16 shrink-0 ring-1 ring-foreground/10">
          {character?.portraitUrl && (
            <AvatarImage src={character.portraitUrl} alt={character.name} />
          )}
          <AvatarFallback className="text-base font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {header}
          <CardTitle className="text-lg leading-tight">{displayName}</CardTitle>
          <CardDescription>
            {character
              ? `Level ${character.level} ${character.race} ${character.characterClass}`
              : fallbackLabel}
          </CardDescription>
        </div>
        {(actions || href) && (
          <CardAction className="self-center ml-auto col-auto row-auto justify-self-auto">
            {actions ?? (
              <ChevronRightIcon className="size-5 text-muted-foreground" />
            )}
          </CardAction>
        )}
      </CardHeader>

      {character && (
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isActive && (
              <Badge className="border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400">
                Active
              </Badge>
            )}
            <Badge className="border-sky-500/20 bg-sky-500/8 text-sky-700 dark:text-sky-400">
              <ShieldIcon className="size-3" />
              AC
              <span className="tabular-nums">{character.armorClass}</span>
            </Badge>
            <Badge className="border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-400">
              <CoinsIcon className="size-3" />
              Gold
              <span className="tabular-nums">{character.gold}</span>
            </Badge>
            <Badge className="border-rose-500/20 bg-rose-500/8 text-rose-700 dark:text-rose-400">
              <ZapIcon className="size-3" />
              Init
              <span className="tabular-nums">
                {formatModifier(character.initiative)}
              </span>
            </Badge>
            <Badge className="border-violet-500/20 bg-violet-500/8 text-violet-700 dark:text-violet-400">
              <FootprintsIcon className="size-3" />
              Spd
              <span className="tabular-nums">{character.speed}ft</span>
            </Badge>
          </div>
          <HpBar
            current={character.currentHp}
            max={character.maxHp}
            temp={character.tempHp}
          />
        </CardContent>
      )}

      {character?.updatedAt && (
        <CardFooter className="justify-end border-t-0 bg-transparent px-4 py-3 text-xs text-muted-foreground">
          Updated {format(character.updatedAt, "MMM d, yyyy")}
        </CardFooter>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {card}
      </Link>
    );
  }

  return card;
}

function HpBar({
  current,
  max,
  temp,
}: {
  current: number;
  max: number;
  temp: number;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const tone =
    pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <HeartIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {current}
        {temp > 0 && <span className="text-emerald-500"> +{temp}</span>}
        <span className="text-muted-foreground/60"> / {max}</span>
      </span>
    </div>
  );
}
