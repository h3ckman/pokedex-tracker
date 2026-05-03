import type { AbilityName } from "@/lib/generated/prisma/client";
import type { ClassDef } from "./classes";
import { ABILITY_NAMES } from "./abilities";

export const STANDARD_ARRAY: readonly number[] = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export function pointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? Number.POSITIVE_INFINITY;
}

export function totalPointBuyCost(scores: Record<AbilityName, number>): number {
  return ABILITY_NAMES.reduce((sum, ability) => sum + pointBuyCost(scores[ability]), 0);
}

export function isValidPointBuy(scores: Record<AbilityName, number>): boolean {
  if (ABILITY_NAMES.some((a) => scores[a] < POINT_BUY_MIN || scores[a] > POINT_BUY_MAX)) {
    return false;
  }
  return totalPointBuyCost(scores) <= POINT_BUY_BUDGET;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function roll4d6DropLowest(): number {
  const rolls = [rollD6(), rollD6(), rollD6(), rollD6()];
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

export function rollStandard4d6DropLowest(): readonly number[] {
  return [
    roll4d6DropLowest(),
    roll4d6DropLowest(),
    roll4d6DropLowest(),
    roll4d6DropLowest(),
    roll4d6DropLowest(),
    roll4d6DropLowest(),
  ];
}

const DEFAULT_PRIORITY: readonly AbilityName[] = ["CON", "DEX", "WIS", "STR", "CHA", "INT"];

const CLASS_PRIORITY: Record<string, readonly AbilityName[]> = {
  Barbarian: ["STR", "CON", "DEX", "WIS", "CHA", "INT"],
  Bard: ["CHA", "DEX", "CON", "WIS", "INT", "STR"],
  Cleric: ["WIS", "CON", "STR", "CHA", "DEX", "INT"],
  Druid: ["WIS", "CON", "DEX", "INT", "CHA", "STR"],
  Fighter: ["STR", "CON", "DEX", "WIS", "CHA", "INT"],
  Monk: ["DEX", "WIS", "CON", "STR", "INT", "CHA"],
  Paladin: ["STR", "CHA", "CON", "WIS", "DEX", "INT"],
  Ranger: ["DEX", "WIS", "CON", "STR", "INT", "CHA"],
  Rogue: ["DEX", "CON", "INT", "WIS", "CHA", "STR"],
  Sorcerer: ["CHA", "CON", "DEX", "WIS", "INT", "STR"],
  Warlock: ["CHA", "CON", "DEX", "WIS", "INT", "STR"],
  Wizard: ["INT", "CON", "DEX", "WIS", "CHA", "STR"],
};

export function priorityForClass(classDef: ClassDef): readonly AbilityName[] {
  const explicit = CLASS_PRIORITY[classDef.name];
  if (explicit) return explicit;

  const seen = new Set<AbilityName>();
  const priority: AbilityName[] = [];
  for (const a of classDef.primaryAbility) {
    if (!seen.has(a)) {
      priority.push(a);
      seen.add(a);
    }
  }
  for (const a of DEFAULT_PRIORITY) {
    if (!seen.has(a)) {
      priority.push(a);
      seen.add(a);
    }
  }
  return priority;
}

export function assignScoresForClass(
  scores: readonly number[],
  classDef: ClassDef,
): Record<AbilityName, number> {
  const sorted = [...scores].sort((a, b) => b - a);
  const priority = priorityForClass(classDef);
  const out = {} as Record<AbilityName, number>;
  priority.forEach((ability, i) => {
    out[ability] = sorted[i] ?? 10;
  });
  return out;
}

export function defaultAbilities(): Record<AbilityName, number> {
  return ABILITY_NAMES.reduce(
    (acc, a) => {
      acc[a] = 10;
      return acc;
    },
    {} as Record<AbilityName, number>,
  );
}

export function pointBuyStartingScores(): Record<AbilityName, number> {
  return ABILITY_NAMES.reduce(
    (acc, a) => {
      acc[a] = 8;
      return acc;
    },
    {} as Record<AbilityName, number>,
  );
}
