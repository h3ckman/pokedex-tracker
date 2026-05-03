import type { AbilityName } from "@/lib/generated/prisma/client";

export const ABILITY_NAMES = [
  "STR",
  "DEX",
  "CON",
  "INT",
  "WIS",
  "CHA",
] as const satisfies readonly AbilityName[];

export const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

export const ABILITY_SHORT: Record<AbilityName, string> = {
  STR: "Str",
  DEX: "Dex",
  CON: "Con",
  INT: "Int",
  WIS: "Wis",
  CHA: "Cha",
};

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
