import type { AbilityName } from "@/lib/generated/prisma/client";

export type CasterType = "none" | "full" | "half" | "third" | "pact";

export type ClassDef = {
  name: string;
  hitDie: number;
  primaryAbility: AbilityName[];
  savingThrows: [AbilityName, AbilityName];
  spellcastingAbility: AbilityName | null;
  caster: CasterType;
  subclasses: readonly string[];
};

export const CLASSES: readonly ClassDef[] = [
  {
    name: "Barbarian",
    hitDie: 12,
    primaryAbility: ["STR"],
    savingThrows: ["STR", "CON"],
    spellcastingAbility: null,
    caster: "none",
    subclasses: ["Berserker", "Totem Warrior", "Ancestral Guardian", "Storm Herald", "Zealot", "Wild Magic"],
  },
  {
    name: "Bard",
    hitDie: 8,
    primaryAbility: ["CHA"],
    savingThrows: ["DEX", "CHA"],
    spellcastingAbility: "CHA",
    caster: "full",
    subclasses: ["College of Lore", "College of Valor", "College of Glamour", "College of Swords", "College of Whispers"],
  },
  {
    name: "Cleric",
    hitDie: 8,
    primaryAbility: ["WIS"],
    savingThrows: ["WIS", "CHA"],
    spellcastingAbility: "WIS",
    caster: "full",
    subclasses: ["Life", "Light", "Knowledge", "Nature", "Tempest", "Trickery", "War", "Death", "Forge", "Grave", "Order", "Peace", "Twilight"],
  },
  {
    name: "Druid",
    hitDie: 8,
    primaryAbility: ["WIS"],
    savingThrows: ["INT", "WIS"],
    spellcastingAbility: "WIS",
    caster: "full",
    subclasses: ["Circle of the Land", "Circle of the Moon", "Circle of Dreams", "Circle of the Shepherd", "Circle of Spores", "Circle of Stars", "Circle of Wildfire"],
  },
  {
    name: "Fighter",
    hitDie: 10,
    primaryAbility: ["STR", "DEX"],
    savingThrows: ["STR", "CON"],
    spellcastingAbility: "INT",
    caster: "third",
    subclasses: ["Champion", "Battle Master", "Eldritch Knight", "Arcane Archer", "Cavalier", "Samurai", "Psi Warrior", "Rune Knight"],
  },
  {
    name: "Monk",
    hitDie: 8,
    primaryAbility: ["DEX", "WIS"],
    savingThrows: ["STR", "DEX"],
    spellcastingAbility: null,
    caster: "none",
    subclasses: ["Open Hand", "Shadow", "Four Elements", "Drunken Master", "Kensei", "Sun Soul", "Mercy", "Astral Self"],
  },
  {
    name: "Paladin",
    hitDie: 10,
    primaryAbility: ["STR", "CHA"],
    savingThrows: ["WIS", "CHA"],
    spellcastingAbility: "CHA",
    caster: "half",
    subclasses: ["Devotion", "Ancients", "Vengeance", "Conquest", "Redemption", "Glory", "Watchers", "Oathbreaker"],
  },
  {
    name: "Ranger",
    hitDie: 10,
    primaryAbility: ["DEX", "WIS"],
    savingThrows: ["STR", "DEX"],
    spellcastingAbility: "WIS",
    caster: "half",
    subclasses: ["Hunter", "Beast Master", "Gloom Stalker", "Horizon Walker", "Monster Slayer", "Fey Wanderer", "Swarmkeeper", "Drakewarden"],
  },
  {
    name: "Rogue",
    hitDie: 8,
    primaryAbility: ["DEX"],
    savingThrows: ["DEX", "INT"],
    spellcastingAbility: "INT",
    caster: "third",
    subclasses: ["Thief", "Assassin", "Arcane Trickster", "Inquisitive", "Mastermind", "Scout", "Swashbuckler", "Phantom", "Soulknife"],
  },
  {
    name: "Sorcerer",
    hitDie: 6,
    primaryAbility: ["CHA"],
    savingThrows: ["CON", "CHA"],
    spellcastingAbility: "CHA",
    caster: "full",
    subclasses: ["Draconic Bloodline", "Wild Magic", "Divine Soul", "Shadow", "Storm", "Aberrant Mind", "Clockwork Soul"],
  },
  {
    name: "Warlock",
    hitDie: 8,
    primaryAbility: ["CHA"],
    savingThrows: ["WIS", "CHA"],
    spellcastingAbility: "CHA",
    caster: "pact",
    subclasses: ["Archfey", "Fiend", "Great Old One", "Celestial", "Hexblade", "Fathomless", "Genie", "Undead"],
  },
  {
    name: "Wizard",
    hitDie: 6,
    primaryAbility: ["INT"],
    savingThrows: ["INT", "WIS"],
    spellcastingAbility: "INT",
    caster: "full",
    subclasses: ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation", "Bladesinging", "Chronurgy", "Graviturgy", "Order of Scribes", "War Magic"],
  },
];

export const CLASS_NAMES = CLASSES.map((c) => c.name);

export function getClass(name: string): ClassDef | undefined {
  return CLASSES.find((c) => c.name === name);
}
