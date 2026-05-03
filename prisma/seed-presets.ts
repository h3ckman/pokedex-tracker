import type { Prisma, PrismaClient } from "../lib/generated/prisma/client";
import { buildQuickDraft } from "../lib/characters/draft-builders";
import type {
  CharacterDraft,
  CharacterDraftIdentity,
} from "../lib/characters/draft-types";
import { DRAFT_PAYLOAD_VERSION } from "../lib/characters/draft-types";

type Archetype = "melee" | "caster" | "support" | "skirmisher";

type PresetSeed = {
  slug: string;
  name: string;
  archetype: Archetype;
  summary: string;
  identity: CharacterDraftIdentity;
  override?: (draft: CharacterDraft) => CharacterDraft;
};

const PRESETS: readonly PresetSeed[] = [
  {
    slug: "greatsword-berserker",
    name: "Greatsword Berserker",
    archetype: "melee",
    summary:
      "A Half-Orc barbarian who hits like a runaway cart and rages through the front line.",
    identity: {
      name: "Krug",
      race: "Half-Orc",
      characterClass: "Barbarian",
      subclass: "Berserker",
      background: "Outlander",
      alignment: "Chaotic Neutral",
    },
  },
  {
    slug: "stout-defender",
    name: "Stout Defender",
    archetype: "melee",
    summary:
      "A dwarven fighter with longsword, shield, and chain mail — the wall behind which softer folk plot.",
    identity: {
      name: "Dura Brightaxe",
      race: "Dwarf",
      subrace: "Mountain Dwarf",
      characterClass: "Fighter",
      subclass: "Champion",
      background: "Soldier",
      alignment: "Lawful Good",
    },
  },
  {
    slug: "oath-of-devotion",
    name: "Oathsworn Paladin",
    archetype: "melee",
    summary:
      "A human paladin sworn to a code of honor, smiting the wicked and lifting the fallen.",
    identity: {
      name: "Aldric",
      race: "Human",
      characterClass: "Paladin",
      subclass: "Devotion",
      background: "Noble",
      alignment: "Lawful Good",
    },
  },
  {
    slug: "war-priest",
    name: "War Priest",
    archetype: "melee",
    summary:
      "A heavily-armored cleric of the war god, mace and miracle in equal measure.",
    identity: {
      name: "Sister Vyra",
      race: "Human",
      characterClass: "Cleric",
      subclass: "War",
      background: "Acolyte",
      alignment: "Lawful Neutral",
    },
  },
  {
    slug: "evoker-wizard",
    name: "Evoker",
    archetype: "caster",
    summary:
      "A studious high-elf wizard who answers most problems with magic missile and burning hands.",
    identity: {
      name: "Aelara",
      race: "Elf",
      subrace: "High Elf",
      characterClass: "Wizard",
      subclass: "Evocation",
      background: "Sage",
      alignment: "Neutral Good",
    },
  },
  {
    slug: "abjurer-protector",
    name: "Abjurer",
    archetype: "support",
    summary:
      "A protective wizard whose ward soaks hits so the rest of the party doesn't have to.",
    identity: {
      name: "Master Cael",
      race: "Half-Elf",
      characterClass: "Wizard",
      subclass: "Abjuration",
      background: "Cloistered Scholar",
      alignment: "Lawful Good",
    },
  },
  {
    slug: "draconic-sorcerer",
    name: "Draconic Sorcerer",
    archetype: "caster",
    summary:
      "A dragonborn sorcerer with fire in the blood and an enthusiasm for problems that solve themselves at 5d8 damage.",
    identity: {
      name: "Khaz",
      race: "Dragonborn",
      subrace: "Red",
      characterClass: "Sorcerer",
      subclass: "Draconic Bloodline",
      background: "Inheritor",
      alignment: "Chaotic Neutral",
    },
  },
  {
    slug: "fiend-warlock",
    name: "Fiend-Pact Warlock",
    archetype: "caster",
    summary:
      "A tiefling who made a deal — eldritch blasts now, paperwork later.",
    identity: {
      name: "Mirena",
      race: "Tiefling",
      characterClass: "Warlock",
      subclass: "Fiend",
      background: "Charlatan",
      alignment: "Chaotic Neutral",
    },
  },
  {
    slug: "life-cleric-healer",
    name: "Life Cleric",
    archetype: "support",
    summary:
      "A halfling cleric of light and life — keeps the party alive when the dice turn cruel.",
    identity: {
      name: "Pip Brightleaf",
      race: "Halfling",
      subrace: "Lightfoot",
      characterClass: "Cleric",
      subclass: "Life",
      background: "Acolyte",
      alignment: "Neutral Good",
    },
  },
  {
    slug: "lore-bard",
    name: "Lore Bard",
    archetype: "support",
    summary:
      "A wandering bard who knows a song for every problem — and has a healing word ready when the song doesn't help.",
    identity: {
      name: "Felicien",
      race: "Half-Elf",
      characterClass: "Bard",
      subclass: "College of Lore",
      background: "Entertainer",
      alignment: "Chaotic Good",
    },
  },
  {
    slug: "circle-of-land",
    name: "Land Druid",
    archetype: "caster",
    summary:
      "A druid of the wild, shaping terrain and spirits to keep wilderness encounters predictable.",
    identity: {
      name: "Yara of the Glade",
      race: "Elf",
      subrace: "Wood Elf",
      characterClass: "Druid",
      subclass: "Circle of the Land",
      background: "Hermit",
      alignment: "True Neutral",
    },
  },
  {
    slug: "thief-rogue",
    name: "Thief",
    archetype: "skirmisher",
    summary:
      "A halfling rogue with quick fingers, quicker feet, and a reliable Sneak Attack.",
    identity: {
      name: "Tobin Quickfoot",
      race: "Halfling",
      subrace: "Lightfoot",
      characterClass: "Rogue",
      subclass: "Thief",
      background: "Criminal",
      alignment: "Chaotic Neutral",
    },
  },
  {
    slug: "assassin-rogue",
    name: "Assassin",
    archetype: "skirmisher",
    summary:
      "A human rogue who specializes in landing the first hit — and ending fights before they begin.",
    identity: {
      name: "Veska",
      race: "Human",
      characterClass: "Rogue",
      subclass: "Assassin",
      background: "Faction Agent",
      alignment: "Lawful Evil",
    },
  },
  {
    slug: "hunter-ranger",
    name: "Hunter Ranger",
    archetype: "skirmisher",
    summary:
      "A wood-elf ranger with a longbow, twin shortswords, and a working knowledge of ambushes.",
    identity: {
      name: "Selene",
      race: "Elf",
      subrace: "Wood Elf",
      characterClass: "Ranger",
      subclass: "Hunter",
      background: "Outlander",
      alignment: "Chaotic Good",
    },
  },
  {
    slug: "open-hand-monk",
    name: "Open-Hand Monk",
    archetype: "skirmisher",
    summary:
      "A human monk of the Way of the Open Hand — fast, precise, and inconveniently durable.",
    identity: {
      name: "Liang",
      race: "Human",
      characterClass: "Monk",
      subclass: "Open Hand",
      background: "Hermit",
      alignment: "Lawful Neutral",
    },
  },
  {
    slug: "eldritch-knight",
    name: "Eldritch Knight",
    archetype: "skirmisher",
    summary:
      "A tiefling fighter who supplements steel with a touch of arcane — Shield, Mage Armor, then a longsword to the chest.",
    identity: {
      name: "Cassia",
      race: "Tiefling",
      characterClass: "Fighter",
      subclass: "Eldritch Knight",
      background: "Mercenary Veteran",
      alignment: "Lawful Neutral",
    },
  },
];

export async function seedCharacterPresets(prisma: PrismaClient): Promise<void> {
  for (const preset of PRESETS) {
    const baseDraft = buildQuickDraft(preset.identity);
    const draft = preset.override ? preset.override(baseDraft) : baseDraft;

    const payload = {
      version: DRAFT_PAYLOAD_VERSION,
      ...draft,
    };

    await prisma.characterPreset.upsert({
      where: { slug: preset.slug },
      update: {
        name: preset.name,
        archetype: preset.archetype,
        summary: preset.summary,
        characterClass: draft.identity.characterClass,
        subclass: draft.identity.subclass,
        race: draft.identity.race,
        subrace: draft.identity.subrace,
        background: draft.identity.background,
        alignment: draft.identity.alignment,
        portraitUrl: draft.identity.portraitUrl,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
      create: {
        slug: preset.slug,
        name: preset.name,
        archetype: preset.archetype,
        summary: preset.summary,
        characterClass: draft.identity.characterClass,
        subclass: draft.identity.subclass,
        race: draft.identity.race,
        subrace: draft.identity.subrace,
        background: draft.identity.background,
        alignment: draft.identity.alignment,
        portraitUrl: draft.identity.portraitUrl,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });
  }
  console.log(`Seeded ${PRESETS.length} character presets`);
}
