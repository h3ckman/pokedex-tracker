import "server-only";
import type {
  ItemRarity,
  ItemType,
  SkillName,
  SpellSchool,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ABILITY_NAMES,
  ITEM_CATALOG,
  SKILLS,
  SPELL_CATALOG,
  abilityModifier,
  getClass,
  getRace,
  spellSlotsForLevel,
} from "@/lib/dnd";
import type {
  CharacterDraft,
  CharacterDraftInventoryItem,
  CharacterDraftSpell,
} from "./draft-types";

export type {
  CharacterDraft,
  CharacterDraftFeature,
  CharacterDraftIdentity,
  CharacterDraftInventoryItem,
  CharacterDraftSpell,
} from "./draft-types";
export { DRAFT_PAYLOAD_VERSION } from "./draft-types";

const ITEM_BY_NAME = new Map(ITEM_CATALOG.map((i) => [i.name, i]));
const SPELL_BY_NAME = new Map(SPELL_CATALOG.map((s) => [s.name, s]));

function resolveItem(item: CharacterDraftInventoryItem) {
  const catalog = ITEM_BY_NAME.get(item.name);
  return {
    name: item.name,
    quantity: item.quantity ?? 1,
    type: item.type ?? catalog?.type ?? ("MISC" as ItemType),
    rarity: item.rarity ?? catalog?.rarity ?? ("COMMON" as ItemRarity),
    weight: item.weight ?? catalog?.weight ?? 0,
    description: item.description ?? catalog?.description ?? null,
    equipped: item.equipped ?? false,
    attuned: item.attuned ?? false,
  };
}

function resolveSpell(spell: CharacterDraftSpell) {
  const catalog = SPELL_BY_NAME.get(spell.name);
  if (!catalog && (spell.level === undefined || !spell.school)) {
    return null;
  }
  return {
    name: spell.name,
    level: spell.level ?? catalog?.level ?? 0,
    school: (spell.school ?? catalog?.school ?? "EVOCATION") as SpellSchool,
    castingTime: spell.castingTime ?? catalog?.castingTime ?? "1 action",
    range: spell.range ?? catalog?.range ?? "Self",
    components: spell.components ?? catalog?.components ?? "V, S",
    duration: spell.duration ?? catalog?.duration ?? "Instantaneous",
    description: spell.description ?? catalog?.description ?? "",
    prepared: spell.prepared ?? false,
    alwaysPrepared: spell.alwaysPrepared ?? false,
  };
}

export async function writeCharacterFromDraft(
  userId: string,
  draft: CharacterDraft,
): Promise<{ id: string }> {
  const { identity, abilities } = draft;
  const classDef = getClass(identity.characterClass);
  const raceDef = getRace(identity.race);

  const hitDie = classDef?.hitDie ?? 8;
  const conMod = abilityModifier(abilities.CON ?? 10);
  const maxHp = Math.max(1, hitDie + conMod);

  const slots = classDef
    ? spellSlotsForLevel(classDef.caster, 1)
    : [0, 0, 0, 0, 0, 0, 0, 0, 0];

  const skillSet = new Set<SkillName>(draft.skillProficiencies);

  const inventoryRows = draft.inventory.map(resolveItem);
  const spellRows = draft.spells
    .map(resolveSpell)
    .filter((s): s is NonNullable<ReturnType<typeof resolveSpell>> => s !== null);

  const character = await prisma.character.create({
    data: {
      userId,
      name: identity.name,
      race: identity.race,
      subrace: identity.subrace,
      characterClass: identity.characterClass,
      subclass: identity.subclass,
      background: identity.background,
      alignment: identity.alignment,
      portraitUrl: identity.portraitUrl,
      personality: identity.personality,
      ideals: identity.ideals,
      bonds: identity.bonds,
      flaws: identity.flaws,
      backstory: identity.backstory,
      appearance: identity.appearance,
      level: 1,
      hitDieType: hitDie,
      hitDiceTotal: 1,
      maxHp,
      currentHp: maxHp,
      speed: raceDef?.speed ?? 30,
      spellcastingAbility: classDef?.spellcastingAbility ?? null,
      slot1Max: slots[0] ?? 0,
      slot2Max: slots[1] ?? 0,
      slot3Max: slots[2] ?? 0,
      slot4Max: slots[3] ?? 0,
      slot5Max: slots[4] ?? 0,
      slot6Max: slots[5] ?? 0,
      slot7Max: slots[6] ?? 0,
      slot8Max: slots[7] ?? 0,
      slot9Max: slots[8] ?? 0,
      abilities: {
        create: ABILITY_NAMES.map((ability) => ({
          ability,
          score: abilities[ability] ?? 10,
        })),
      },
      savingThrows: {
        create: ABILITY_NAMES.map((ability) => ({
          ability,
          proficient: classDef?.savingThrows.includes(ability) ?? false,
        })),
      },
      skills: {
        create: SKILLS.map((s) => ({
          skill: s.name,
          proficient: skillSet.has(s.name),
        })),
      },
      inventory: inventoryRows.length
        ? { create: inventoryRows }
        : undefined,
      spells: spellRows.length ? { create: spellRows } : undefined,
      features: draft.features.length
        ? { create: draft.features.map((f) => ({ ...f })) }
        : undefined,
    },
    select: { id: true },
  });

  return { id: character.id };
}
