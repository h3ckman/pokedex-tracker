import type { ItemType } from "@/lib/generated/prisma/client";

export type EquipmentBundleItem = {
  name: string;
  quantity?: number;
  type?: ItemType;
  equipped?: boolean;
};

export type EquipmentBundle = {
  label: string;
  description?: string;
  items: readonly EquipmentBundleItem[];
};

const COMMON: readonly EquipmentBundleItem[] = [
  { name: "Backpack" },
  { name: "Bedroll" },
  { name: "Rations (1 day)", quantity: 5 },
  { name: "Waterskin" },
  { name: "Tinderbox" },
];

export const CLASS_EQUIPMENT_BUNDLES: Record<string, readonly EquipmentBundle[]> = {
  Barbarian: [
    {
      label: "Greataxe & Handaxes",
      description: "Hard-hitting two-hander with thrown backups.",
      items: [
        { name: "Greataxe", equipped: true },
        { name: "Handaxe", quantity: 4 },
        { name: "Javelin", quantity: 4 },
        ...COMMON,
      ],
    },
    {
      label: "Battleaxe & Shield",
      description: "Sword-and-board barbarian.",
      items: [
        { name: "Battleaxe", equipped: true },
        { name: "Shield", equipped: true },
        { name: "Javelin", quantity: 4 },
        ...COMMON,
      ],
    },
  ],
  Bard: [
    {
      label: "Rapier & Lute",
      description: "Classic finesse bard with a performance instrument.",
      items: [
        { name: "Rapier", equipped: true },
        { name: "Leather Armor", equipped: true },
        { name: "Dagger" },
        ...COMMON,
      ],
    },
  ],
  Cleric: [
    {
      label: "Mace, Shield, & Holy Symbol",
      description: "Front-line cleric with chain mail.",
      items: [
        { name: "Mace", equipped: true },
        { name: "Shield", equipped: true },
        { name: "Chain Mail", equipped: true },
        { name: "Holy Symbol" },
        { name: "Light Crossbow" },
        ...COMMON,
      ],
    },
  ],
  Druid: [
    {
      label: "Scimitar & Druidic Focus",
      description: "Light armored caster with a versatile blade.",
      items: [
        { name: "Scimitar", equipped: true },
        { name: "Leather Armor", equipped: true },
        { name: "Shield", equipped: true },
        { name: "Druidic Focus" },
        ...COMMON,
      ],
    },
  ],
  Fighter: [
    {
      label: "Longsword & Shield",
      description: "Sword-and-board defender with chain mail.",
      items: [
        { name: "Longsword", equipped: true },
        { name: "Shield", equipped: true },
        { name: "Chain Mail", equipped: true },
        { name: "Light Crossbow" },
        ...COMMON,
      ],
    },
    {
      label: "Greatsword Two-Hander",
      description: "Heavy hitter in chain mail.",
      items: [
        { name: "Greatsword", equipped: true },
        { name: "Chain Mail", equipped: true },
        { name: "Handaxe", quantity: 2 },
        ...COMMON,
      ],
    },
  ],
  Monk: [
    {
      label: "Shortsword & Darts",
      description: "Mobile martial artist; no armor.",
      items: [
        { name: "Shortsword", equipped: true },
        { name: "Dagger", quantity: 10 },
        ...COMMON,
      ],
    },
  ],
  Paladin: [
    {
      label: "Longsword, Shield, & Holy Symbol",
      description: "Smiting front-liner with chain mail.",
      items: [
        { name: "Longsword", equipped: true },
        { name: "Shield", equipped: true },
        { name: "Chain Mail", equipped: true },
        { name: "Javelin", quantity: 5 },
        { name: "Holy Symbol" },
        ...COMMON,
      ],
    },
  ],
  Ranger: [
    {
      label: "Longbow & Two Shortswords",
      description: "Two-weapon fighter with reliable bow.",
      items: [
        { name: "Longbow", equipped: true },
        { name: "Shortsword", quantity: 2, equipped: true },
        { name: "Studded Leather", equipped: true },
        ...COMMON,
      ],
    },
  ],
  Rogue: [
    {
      label: "Rapier, Shortbow, & Thieves' Tools",
      description: "Stealthy skirmisher.",
      items: [
        { name: "Rapier", equipped: true },
        { name: "Shortbow" },
        { name: "Leather Armor", equipped: true },
        { name: "Dagger", quantity: 2 },
        { name: "Thieves' Tools" },
        ...COMMON,
      ],
    },
  ],
  Sorcerer: [
    {
      label: "Daggers & Arcane Focus",
      description: "No armor; blast at range.",
      items: [
        { name: "Dagger", quantity: 2 },
        { name: "Arcane Focus (Wand)" },
        { name: "Component Pouch" },
        ...COMMON,
      ],
    },
  ],
  Warlock: [
    {
      label: "Light Crossbow & Arcane Focus",
      description: "Eldritch Blast on tap; leather armor for safety.",
      items: [
        { name: "Light Crossbow", equipped: true },
        { name: "Leather Armor", equipped: true },
        { name: "Dagger", quantity: 2 },
        { name: "Arcane Focus (Orb)" },
        { name: "Component Pouch" },
        ...COMMON,
      ],
    },
  ],
  Wizard: [
    {
      label: "Quarterstaff, Spellbook, & Focus",
      description: "Classic studious caster.",
      items: [
        { name: "Quarterstaff" },
        { name: "Dagger" },
        { name: "Spellbook" },
        { name: "Arcane Focus (Wand)" },
        { name: "Component Pouch" },
        ...COMMON,
      ],
    },
  ],
};

export function getClassEquipmentBundles(
  className: string,
): readonly EquipmentBundle[] {
  return CLASS_EQUIPMENT_BUNDLES[className] ?? [];
}
