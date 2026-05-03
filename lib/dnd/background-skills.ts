import type { SkillName } from "@/lib/generated/prisma/client";

export type BackgroundEquipmentItem = {
  name: string;
  quantity?: number;
};

export type BackgroundGrant = {
  skills: readonly SkillName[];
  tools?: readonly string[];
  languages?: number;
  equipment: readonly BackgroundEquipmentItem[];
  startingGold?: number;
};

export const BACKGROUND_GRANTS: Record<string, BackgroundGrant> = {
  Acolyte: {
    skills: ["INSIGHT", "RELIGION"],
    languages: 2,
    equipment: [
      { name: "Holy Symbol" },
      { name: "Component Pouch" },
      { name: "Rations (1 day)", quantity: 5 },
    ],
    startingGold: 15,
  },
  Charlatan: {
    skills: ["DECEPTION", "SLEIGHT_OF_HAND"],
    tools: ["Disguise Kit", "Forgery Kit"],
    equipment: [{ name: "Disguise Kit" }, { name: "Forgery Kit" }],
    startingGold: 15,
  },
  Criminal: {
    skills: ["DECEPTION", "STEALTH"],
    tools: ["Thieves' Tools"],
    equipment: [{ name: "Crowbar" }, { name: "Thieves' Tools" }],
    startingGold: 15,
  },
  Entertainer: {
    skills: ["ACROBATICS", "PERFORMANCE"],
    tools: ["Disguise Kit"],
    equipment: [{ name: "Disguise Kit" }],
    startingGold: 15,
  },
  "Folk Hero": {
    skills: ["ANIMAL_HANDLING", "SURVIVAL"],
    tools: ["Smith's Tools"],
    equipment: [{ name: "Smith's Tools" }, { name: "Backpack" }],
    startingGold: 10,
  },
  "Guild Artisan": {
    skills: ["INSIGHT", "PERSUASION"],
    tools: ["Smith's Tools"],
    languages: 1,
    equipment: [{ name: "Smith's Tools" }],
    startingGold: 15,
  },
  Hermit: {
    skills: ["MEDICINE", "RELIGION"],
    tools: ["Herbalism Kit"],
    languages: 1,
    equipment: [{ name: "Herbalism Kit" }, { name: "Holy Symbol" }],
    startingGold: 5,
  },
  Noble: {
    skills: ["HISTORY", "PERSUASION"],
    languages: 1,
    equipment: [{ name: "Backpack" }],
    startingGold: 25,
  },
  Outlander: {
    skills: ["ATHLETICS", "SURVIVAL"],
    languages: 1,
    equipment: [{ name: "Backpack" }, { name: "Bedroll" }, { name: "Rations (1 day)", quantity: 10 }],
    startingGold: 10,
  },
  Sage: {
    skills: ["ARCANA", "HISTORY"],
    languages: 2,
    equipment: [{ name: "Backpack" }, { name: "Spellbook" }],
    startingGold: 10,
  },
  Sailor: {
    skills: ["ATHLETICS", "PERCEPTION"],
    equipment: [{ name: "Rope, Hempen (50 ft)" }, { name: "Backpack" }],
    startingGold: 10,
  },
  Soldier: {
    skills: ["ATHLETICS", "INTIMIDATION"],
    equipment: [{ name: "Backpack" }, { name: "Bedroll" }],
    startingGold: 10,
  },
  Urchin: {
    skills: ["SLEIGHT_OF_HAND", "STEALTH"],
    tools: ["Disguise Kit", "Thieves' Tools"],
    equipment: [{ name: "Disguise Kit" }, { name: "Thieves' Tools" }],
    startingGold: 10,
  },
  "City Watch": {
    skills: ["ATHLETICS", "INSIGHT"],
    languages: 2,
    equipment: [{ name: "Manacles" }, { name: "Backpack" }],
    startingGold: 10,
  },
  "Clan Crafter": {
    skills: ["HISTORY", "INSIGHT"],
    tools: ["Smith's Tools"],
    languages: 1,
    equipment: [{ name: "Smith's Tools" }],
    startingGold: 5,
  },
  "Cloistered Scholar": {
    skills: ["HISTORY", "RELIGION"],
    languages: 2,
    equipment: [{ name: "Spellbook" }, { name: "Backpack" }],
    startingGold: 10,
  },
  Courtier: {
    skills: ["INSIGHT", "PERSUASION"],
    languages: 2,
    equipment: [{ name: "Backpack" }],
    startingGold: 5,
  },
  "Faction Agent": {
    skills: ["INSIGHT", "INVESTIGATION"],
    languages: 2,
    equipment: [{ name: "Backpack" }],
    startingGold: 15,
  },
  "Far Traveler": {
    skills: ["INSIGHT", "PERCEPTION"],
    languages: 1,
    equipment: [{ name: "Backpack" }, { name: "Bedroll" }],
    startingGold: 5,
  },
  Inheritor: {
    skills: ["SURVIVAL", "ARCANA"],
    languages: 1,
    equipment: [{ name: "Backpack" }],
    startingGold: 15,
  },
  "Knight of the Order": {
    skills: ["PERSUASION", "RELIGION"],
    languages: 1,
    equipment: [{ name: "Backpack" }],
    startingGold: 10,
  },
  "Mercenary Veteran": {
    skills: ["ATHLETICS", "PERSUASION"],
    equipment: [{ name: "Backpack" }],
    startingGold: 10,
  },
  "Haunted One": {
    skills: ["ARCANA", "RELIGION"],
    languages: 1,
    equipment: [{ name: "Holy Symbol" }],
    startingGold: 0,
  },
  Investigator: {
    skills: ["INSIGHT", "INVESTIGATION"],
    equipment: [{ name: "Backpack" }],
    startingGold: 10,
  },
  Anthropologist: {
    skills: ["INSIGHT", "RELIGION"],
    languages: 2,
    equipment: [{ name: "Backpack" }],
    startingGold: 10,
  },
  Archaeologist: {
    skills: ["HISTORY", "SURVIVAL"],
    tools: ["Cartographer's Tools"],
    languages: 1,
    equipment: [{ name: "Backpack" }],
    startingGold: 25,
  },
};

export function getBackgroundGrant(name: string): BackgroundGrant | undefined {
  return BACKGROUND_GRANTS[name];
}
