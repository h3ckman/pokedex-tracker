import type { SkillName } from "@/lib/generated/prisma/client";

export type ClassSkillChoice = {
  count: number;
  from: readonly SkillName[];
};

export const CLASS_SKILL_CHOICES: Record<string, ClassSkillChoice> = {
  Barbarian: {
    count: 2,
    from: ["ANIMAL_HANDLING", "ATHLETICS", "INTIMIDATION", "NATURE", "PERCEPTION", "SURVIVAL"],
  },
  Bard: {
    count: 3,
    from: [
      "ACROBATICS", "ANIMAL_HANDLING", "ARCANA", "ATHLETICS", "DECEPTION",
      "HISTORY", "INSIGHT", "INTIMIDATION", "INVESTIGATION", "MEDICINE",
      "NATURE", "PERCEPTION", "PERFORMANCE", "PERSUASION", "RELIGION",
      "SLEIGHT_OF_HAND", "STEALTH", "SURVIVAL",
    ],
  },
  Cleric: {
    count: 2,
    from: ["HISTORY", "INSIGHT", "MEDICINE", "PERSUASION", "RELIGION"],
  },
  Druid: {
    count: 2,
    from: ["ARCANA", "ANIMAL_HANDLING", "INSIGHT", "MEDICINE", "NATURE", "PERCEPTION", "RELIGION", "SURVIVAL"],
  },
  Fighter: {
    count: 2,
    from: ["ACROBATICS", "ANIMAL_HANDLING", "ATHLETICS", "HISTORY", "INSIGHT", "INTIMIDATION", "PERCEPTION", "SURVIVAL"],
  },
  Monk: {
    count: 2,
    from: ["ACROBATICS", "ATHLETICS", "HISTORY", "INSIGHT", "RELIGION", "STEALTH"],
  },
  Paladin: {
    count: 2,
    from: ["ATHLETICS", "INSIGHT", "INTIMIDATION", "MEDICINE", "PERSUASION", "RELIGION"],
  },
  Ranger: {
    count: 3,
    from: ["ANIMAL_HANDLING", "ATHLETICS", "INSIGHT", "INVESTIGATION", "NATURE", "PERCEPTION", "STEALTH", "SURVIVAL"],
  },
  Rogue: {
    count: 4,
    from: [
      "ACROBATICS", "ATHLETICS", "DECEPTION", "INSIGHT", "INTIMIDATION",
      "INVESTIGATION", "PERCEPTION", "PERFORMANCE", "PERSUASION",
      "SLEIGHT_OF_HAND", "STEALTH",
    ],
  },
  Sorcerer: {
    count: 2,
    from: ["ARCANA", "DECEPTION", "INSIGHT", "INTIMIDATION", "PERSUASION", "RELIGION"],
  },
  Warlock: {
    count: 2,
    from: ["ARCANA", "DECEPTION", "HISTORY", "INTIMIDATION", "INVESTIGATION", "NATURE", "RELIGION"],
  },
  Wizard: {
    count: 2,
    from: ["ARCANA", "HISTORY", "INSIGHT", "INVESTIGATION", "MEDICINE", "RELIGION"],
  },
};

export function getClassSkillChoice(className: string): ClassSkillChoice | undefined {
  return CLASS_SKILL_CHOICES[className];
}
