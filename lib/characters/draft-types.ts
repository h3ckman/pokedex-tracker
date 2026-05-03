import type {
  AbilityName,
  ItemRarity,
  ItemType,
  SkillName,
  SpellSchool,
} from "@/lib/generated/prisma/client";

export type CharacterDraftIdentity = {
  name: string;
  race: string;
  subrace?: string;
  characterClass: string;
  subclass?: string;
  background: string;
  alignment: string;
  portraitUrl?: string;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  appearance?: string;
};

export type CharacterDraftInventoryItem = {
  name: string;
  quantity?: number;
  type?: ItemType;
  rarity?: ItemRarity;
  weight?: number;
  description?: string;
  equipped?: boolean;
  attuned?: boolean;
};

export type CharacterDraftSpell = {
  name: string;
  level?: number;
  school?: SpellSchool;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  prepared?: boolean;
  alwaysPrepared?: boolean;
};

export type CharacterDraftFeature = {
  name: string;
  source: string;
  description: string;
};

export type CharacterDraft = {
  identity: CharacterDraftIdentity;
  abilities: Record<AbilityName, number>;
  skillProficiencies: readonly SkillName[];
  inventory: readonly CharacterDraftInventoryItem[];
  spells: readonly CharacterDraftSpell[];
  features: readonly CharacterDraftFeature[];
};

export const DRAFT_PAYLOAD_VERSION = 1;
