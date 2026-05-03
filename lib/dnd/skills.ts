import type { AbilityName, SkillName } from "@/lib/generated/prisma/client";

export type SkillDef = {
  name: SkillName;
  label: string;
  ability: AbilityName;
};

export const SKILLS: readonly SkillDef[] = [
  { name: "ACROBATICS", label: "Acrobatics", ability: "DEX" },
  { name: "ANIMAL_HANDLING", label: "Animal Handling", ability: "WIS" },
  { name: "ARCANA", label: "Arcana", ability: "INT" },
  { name: "ATHLETICS", label: "Athletics", ability: "STR" },
  { name: "DECEPTION", label: "Deception", ability: "CHA" },
  { name: "HISTORY", label: "History", ability: "INT" },
  { name: "INSIGHT", label: "Insight", ability: "WIS" },
  { name: "INTIMIDATION", label: "Intimidation", ability: "CHA" },
  { name: "INVESTIGATION", label: "Investigation", ability: "INT" },
  { name: "MEDICINE", label: "Medicine", ability: "WIS" },
  { name: "NATURE", label: "Nature", ability: "INT" },
  { name: "PERCEPTION", label: "Perception", ability: "WIS" },
  { name: "PERFORMANCE", label: "Performance", ability: "CHA" },
  { name: "PERSUASION", label: "Persuasion", ability: "CHA" },
  { name: "RELIGION", label: "Religion", ability: "INT" },
  { name: "SLEIGHT_OF_HAND", label: "Sleight of Hand", ability: "DEX" },
  { name: "STEALTH", label: "Stealth", ability: "DEX" },
  { name: "SURVIVAL", label: "Survival", ability: "WIS" },
];

export const SKILL_BY_NAME: Record<SkillName, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.name, s]),
) as Record<SkillName, SkillDef>;
