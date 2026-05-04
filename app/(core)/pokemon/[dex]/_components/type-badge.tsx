import { Badge } from "@/components/ui/badge";
import type { PokemonType } from "@/lib/generated/prisma/client";

const TYPE_LABEL: Record<PokemonType, string> = {
  NORMAL: "Normal",
  FIRE: "Fire",
  WATER: "Water",
  GRASS: "Grass",
  ELECTRIC: "Electric",
  ICE: "Ice",
  FIGHTING: "Fighting",
  POISON: "Poison",
  GROUND: "Ground",
  FLYING: "Flying",
  PSYCHIC: "Psychic",
  BUG: "Bug",
  ROCK: "Rock",
  GHOST: "Ghost",
  DRAGON: "Dragon",
  DARK: "Dark",
  STEEL: "Steel",
  FAIRY: "Fairy",
};

const TYPE_CLASSES: Record<PokemonType, string> = {
  NORMAL: "bg-stone-400 text-stone-50",
  FIRE: "bg-orange-500 text-orange-50",
  WATER: "bg-blue-500 text-blue-50",
  GRASS: "bg-emerald-500 text-emerald-50",
  ELECTRIC: "bg-yellow-400 text-yellow-950",
  ICE: "bg-cyan-300 text-cyan-950",
  FIGHTING: "bg-red-700 text-red-50",
  POISON: "bg-purple-600 text-purple-50",
  GROUND: "bg-amber-700 text-amber-50",
  FLYING: "bg-sky-400 text-sky-950",
  PSYCHIC: "bg-pink-500 text-pink-50",
  BUG: "bg-lime-600 text-lime-50",
  ROCK: "bg-stone-600 text-stone-50",
  GHOST: "bg-violet-700 text-violet-50",
  DRAGON: "bg-indigo-600 text-indigo-50",
  DARK: "bg-zinc-800 text-zinc-50",
  STEEL: "bg-slate-500 text-slate-50",
  FAIRY: "bg-rose-400 text-rose-50",
};

export function TypeBadge({ type }: { type: PokemonType }) {
  return (
    <Badge
      className={`${TYPE_CLASSES[type]} h-6 px-3 text-sm font-semibold uppercase tracking-wide`}
    >
      {TYPE_LABEL[type]}
    </Badge>
  );
}
