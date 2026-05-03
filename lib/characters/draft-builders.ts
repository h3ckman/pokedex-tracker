import type { SkillName } from "@/lib/generated/prisma/client";
import {
  BACKGROUND_GRANTS,
  CLASS_EQUIPMENT_BUNDLES,
  CLASS_SKILL_CHOICES,
  LEVEL1_FEATURES,
  LEVEL1_SUGGESTED,
  STANDARD_ARRAY,
  SPELL_CATALOG,
  assignScoresForClass,
  defaultAbilities,
  getClass,
} from "@/lib/dnd";
import type {
  CharacterDraft,
  CharacterDraftIdentity,
  CharacterDraftInventoryItem,
  CharacterDraftSpell,
} from "./draft-types";

const SPELL_BY_NAME = new Map(SPELL_CATALOG.map((s) => [s.name, s]));

function classFeatures(className: string) {
  return (LEVEL1_FEATURES[className] ?? []).map((f) => ({
    name: f.name,
    source: f.source,
    description: f.description,
  }));
}

function backgroundGear(background: string): readonly CharacterDraftInventoryItem[] {
  const grant = BACKGROUND_GRANTS[background];
  if (!grant) return [];
  return grant.equipment.map((e) => ({
    name: e.name,
    quantity: e.quantity ?? 1,
  }));
}

function backgroundSkillNames(background: string): readonly SkillName[] {
  return BACKGROUND_GRANTS[background]?.skills ?? [];
}

function defaultClassSkills(
  className: string,
  exclude: ReadonlySet<SkillName>,
): readonly SkillName[] {
  const choice = CLASS_SKILL_CHOICES[className];
  if (!choice) return [];
  const picked: SkillName[] = [];
  for (const skill of choice.from) {
    if (picked.length >= choice.count) break;
    if (!exclude.has(skill)) picked.push(skill);
  }
  return picked;
}

function defaultClassEquipment(className: string): readonly CharacterDraftInventoryItem[] {
  const bundles = CLASS_EQUIPMENT_BUNDLES[className];
  if (!bundles?.length) return [];
  return bundles[0].items.map((i) => ({ ...i }));
}

function defaultSuggestedSpells(className: string): readonly CharacterDraftSpell[] {
  const suggestion = LEVEL1_SUGGESTED[className];
  if (!suggestion) return [];
  const out: CharacterDraftSpell[] = [];
  for (const name of suggestion.cantrips.slice(0, suggestion.cantripCap)) {
    if (SPELL_BY_NAME.has(name)) out.push({ name, prepared: true });
  }
  for (const name of suggestion.spells.slice(0, suggestion.spellCap)) {
    if (SPELL_BY_NAME.has(name)) out.push({ name, prepared: true });
  }
  return out;
}

export function buildBlankDraft(identity: CharacterDraftIdentity): CharacterDraft {
  return {
    identity,
    abilities: defaultAbilities(),
    skillProficiencies: [],
    inventory: [],
    spells: [],
    features: classFeatures(identity.characterClass),
  };
}

export function buildQuickDraft(identity: CharacterDraftIdentity): CharacterDraft {
  const classDef = getClass(identity.characterClass);
  const abilities = classDef
    ? assignScoresForClass(STANDARD_ARRAY, classDef)
    : defaultAbilities();

  const bgSkills = backgroundSkillNames(identity.background);
  const exclude = new Set<SkillName>(bgSkills);
  const classSkills = defaultClassSkills(identity.characterClass, exclude);
  const skillProficiencies = [...bgSkills, ...classSkills];

  const inventory = [
    ...defaultClassEquipment(identity.characterClass),
    ...backgroundGear(identity.background),
  ];

  const spells = classDef && classDef.caster !== "none"
    ? defaultSuggestedSpells(identity.characterClass)
    : [];

  return {
    identity,
    abilities,
    skillProficiencies,
    inventory,
    spells,
    features: classFeatures(identity.characterClass),
  };
}
