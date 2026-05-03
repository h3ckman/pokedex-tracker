export type ClassFeature = {
  name: string;
  source: string;
  description: string;
};

export const LEVEL1_FEATURES: Record<string, readonly ClassFeature[]> = {
  Barbarian: [
    {
      name: "Rage",
      source: "Barbarian 1",
      description:
        "As a bonus action, enter rage for up to 1 minute: advantage on STR checks/saves, +2 damage on STR melee attacks, resistance to bludgeoning/piercing/slashing.",
    },
    {
      name: "Unarmored Defense",
      source: "Barbarian 1",
      description: "While not wearing armor, AC = 10 + DEX mod + CON mod. Shield permitted.",
    },
  ],
  Bard: [
    {
      name: "Bardic Inspiration (d6)",
      source: "Bard 1",
      description:
        "Bonus action: grant a creature within 60 ft a d6 to add to one ability check, attack roll, or saving throw within 10 minutes.",
    },
    {
      name: "Spellcasting",
      source: "Bard 1",
      description: "Cast bard spells using CHA. Two cantrips and four 1st-level spells known.",
    },
  ],
  Cleric: [
    {
      name: "Spellcasting",
      source: "Cleric 1",
      description:
        "Cast cleric spells using WIS. Three cantrips known; prepare WIS mod + cleric level spells daily.",
    },
    {
      name: "Divine Domain",
      source: "Cleric 1",
      description: "Choose a domain that grants additional features and a domain spell list.",
    },
  ],
  Druid: [
    {
      name: "Druidic",
      source: "Druid 1",
      description:
        "You know Druidic, a secret language. Other creatures can't decipher it without magic.",
    },
    {
      name: "Spellcasting",
      source: "Druid 1",
      description:
        "Cast druid spells using WIS. Two cantrips known; prepare WIS mod + druid level spells daily.",
    },
  ],
  Fighter: [
    {
      name: "Fighting Style",
      source: "Fighter 1",
      description:
        "Choose a fighting style: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.",
    },
    {
      name: "Second Wind",
      source: "Fighter 1",
      description:
        "Bonus action: regain 1d10 + fighter level HP. Recharges on a short or long rest.",
    },
  ],
  Monk: [
    {
      name: "Unarmored Defense",
      source: "Monk 1",
      description: "While not wearing armor or shield, AC = 10 + DEX mod + WIS mod.",
    },
    {
      name: "Martial Arts",
      source: "Monk 1",
      description:
        "Use DEX for monk weapon attacks; martial arts die 1d4 at level 1; bonus-action unarmed strike after attacking.",
    },
  ],
  Paladin: [
    {
      name: "Divine Sense",
      source: "Paladin 1",
      description:
        "Action: detect celestials, fiends, and undead within 60 ft. Uses = 1 + CHA mod per long rest.",
    },
    {
      name: "Lay on Hands",
      source: "Paladin 1",
      description:
        "Pool of paladin level x 5 HP. Action: heal HP from the pool, or expend 5 to cure disease/poison.",
    },
  ],
  Ranger: [
    {
      name: "Favored Enemy",
      source: "Ranger 1",
      description:
        "Advantage on Survival to track and INT checks to recall info on a chosen creature type. Learn one of its languages.",
    },
    {
      name: "Natural Explorer",
      source: "Ranger 1",
      description:
        "Choose a favored terrain: bonuses to navigation, foraging, and stealth in that environment.",
    },
  ],
  Rogue: [
    {
      name: "Expertise",
      source: "Rogue 1",
      description:
        "Choose two of your skill proficiencies (or one and Thieves' Tools) — proficiency bonus is doubled for those checks.",
    },
    {
      name: "Sneak Attack (1d6)",
      source: "Rogue 1",
      description:
        "Once per turn, deal +1d6 damage with a finesse or ranged weapon when you have advantage or an ally is within 5 ft of the target.",
    },
    {
      name: "Thieves' Cant",
      source: "Rogue 1",
      description:
        "Secret rogue dialect. Convey messages and signs to other speakers of the cant.",
    },
  ],
  Sorcerer: [
    {
      name: "Spellcasting",
      source: "Sorcerer 1",
      description:
        "Cast sorcerer spells using CHA. Four cantrips known; two 1st-level spells known.",
    },
    {
      name: "Sorcerous Origin",
      source: "Sorcerer 1",
      description: "Choose an origin that grants additional features and abilities.",
    },
  ],
  Warlock: [
    {
      name: "Otherworldly Patron",
      source: "Warlock 1",
      description:
        "Choose a patron that grants additional spells and features.",
    },
    {
      name: "Pact Magic",
      source: "Warlock 1",
      description:
        "Cast warlock spells using CHA. Two cantrips and two 1st-level spells known. One spell slot at the highest level you can cast — recharges on short rest.",
    },
  ],
  Wizard: [
    {
      name: "Spellcasting",
      source: "Wizard 1",
      description:
        "Cast wizard spells using INT. Three cantrips known; spellbook holds six 1st-level spells; prepare INT mod + wizard level spells daily.",
    },
    {
      name: "Arcane Recovery",
      source: "Wizard 1",
      description:
        "Once per day on a short rest, recover spell slots up to half wizard level (rounded up); none above 5th level.",
    },
  ],
};

export function getLevel1Features(className: string): readonly ClassFeature[] {
  return LEVEL1_FEATURES[className] ?? [];
}
