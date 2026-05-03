export type SuggestedSpells = {
  cantrips: readonly string[];
  spells: readonly string[];
  cantripCap: number;
  spellCap: number;
};

export const LEVEL1_SUGGESTED: Record<string, SuggestedSpells> = {
  Bard: {
    cantrips: ["Vicious Mockery", "Mage Hand", "Minor Illusion", "Prestidigitation"],
    spells: ["Healing Word", "Faerie Fire", "Charm Person", "Sleep", "Cure Wounds", "Detect Magic"],
    cantripCap: 2,
    spellCap: 4,
  },
  Cleric: {
    cantrips: ["Sacred Flame", "Guidance", "Light", "Spare the Dying", "Thaumaturgy"],
    spells: ["Cure Wounds", "Bless", "Healing Word", "Detect Magic"],
    cantripCap: 3,
    spellCap: 4,
  },
  Druid: {
    cantrips: ["Druidcraft", "Guidance", "Mending", "Shillelagh", "Poison Spray"],
    spells: ["Cure Wounds", "Faerie Fire", "Healing Word", "Detect Magic"],
    cantripCap: 2,
    spellCap: 4,
  },
  Sorcerer: {
    cantrips: ["Fire Bolt", "Mage Hand", "Minor Illusion", "Prestidigitation", "Ray of Frost", "Light"],
    spells: ["Magic Missile", "Shield", "Mage Armor", "Burning Hands", "Charm Person"],
    cantripCap: 4,
    spellCap: 2,
  },
  Warlock: {
    cantrips: ["Eldritch Blast", "Mage Hand", "Minor Illusion", "Prestidigitation"],
    spells: ["Charm Person", "Burning Hands", "Mage Armor", "Faerie Fire"],
    cantripCap: 2,
    spellCap: 2,
  },
  Wizard: {
    cantrips: ["Fire Bolt", "Mage Hand", "Minor Illusion", "Prestidigitation", "Ray of Frost", "Light"],
    spells: [
      "Magic Missile", "Shield", "Mage Armor", "Burning Hands",
      "Sleep", "Charm Person", "Detect Magic", "Thunderwave",
    ],
    cantripCap: 3,
    spellCap: 6,
  },
};

export function getSuggestedSpells(className: string): SuggestedSpells | undefined {
  return LEVEL1_SUGGESTED[className];
}
