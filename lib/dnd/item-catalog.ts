import type {
  ItemRarity,
  ItemType,
} from "@/lib/generated/prisma/client";

export type CatalogItem = {
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  weight: number;
  description: string;
};

export const ITEM_CATALOG: readonly CatalogItem[] = [
  // Simple Weapons
  { name: "Club", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple melee. 1d4 bludgeoning. Light." },
  { name: "Dagger", type: "WEAPON", rarity: "COMMON", weight: 1, description: "Simple melee. 1d4 piercing. Finesse, light, thrown (20/60)." },
  { name: "Greatclub", type: "WEAPON", rarity: "COMMON", weight: 10, description: "Simple melee. 1d8 bludgeoning. Two-handed." },
  { name: "Handaxe", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple melee. 1d6 slashing. Light, thrown (20/60)." },
  { name: "Javelin", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple melee. 1d6 piercing. Thrown (30/120)." },
  { name: "Light Hammer", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple melee. 1d4 bludgeoning. Light, thrown (20/60)." },
  { name: "Mace", type: "WEAPON", rarity: "COMMON", weight: 4, description: "Simple melee. 1d6 bludgeoning." },
  { name: "Quarterstaff", type: "WEAPON", rarity: "COMMON", weight: 4, description: "Simple melee. 1d6 bludgeoning. Versatile (1d8)." },
  { name: "Sickle", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple melee. 1d4 slashing. Light." },
  { name: "Spear", type: "WEAPON", rarity: "COMMON", weight: 3, description: "Simple melee. 1d6 piercing. Thrown (20/60), versatile (1d8)." },
  { name: "Light Crossbow", type: "WEAPON", rarity: "COMMON", weight: 5, description: "Simple ranged. 1d8 piercing. Ammo (80/320), loading, two-handed." },
  { name: "Shortbow", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Simple ranged. 1d6 piercing. Ammo (80/320), two-handed." },
  { name: "Sling", type: "WEAPON", rarity: "COMMON", weight: 0, description: "Simple ranged. 1d4 bludgeoning. Ammo (30/120)." },

  // Martial Weapons
  { name: "Battleaxe", type: "WEAPON", rarity: "COMMON", weight: 4, description: "Martial melee. 1d8 slashing. Versatile (1d10)." },
  { name: "Flail", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Martial melee. 1d8 bludgeoning." },
  { name: "Glaive", type: "WEAPON", rarity: "COMMON", weight: 6, description: "Martial melee. 1d10 slashing. Heavy, reach, two-handed." },
  { name: "Greataxe", type: "WEAPON", rarity: "COMMON", weight: 7, description: "Martial melee. 1d12 slashing. Heavy, two-handed." },
  { name: "Greatsword", type: "WEAPON", rarity: "COMMON", weight: 6, description: "Martial melee. 2d6 slashing. Heavy, two-handed." },
  { name: "Halberd", type: "WEAPON", rarity: "COMMON", weight: 6, description: "Martial melee. 1d10 slashing. Heavy, reach, two-handed." },
  { name: "Lance", type: "WEAPON", rarity: "COMMON", weight: 6, description: "Martial melee. 1d12 piercing. Reach. Disadvantage within 5 ft." },
  { name: "Longsword", type: "WEAPON", rarity: "COMMON", weight: 3, description: "Martial melee. 1d8 slashing. Versatile (1d10)." },
  { name: "Maul", type: "WEAPON", rarity: "COMMON", weight: 10, description: "Martial melee. 2d6 bludgeoning. Heavy, two-handed." },
  { name: "Morningstar", type: "WEAPON", rarity: "COMMON", weight: 4, description: "Martial melee. 1d8 piercing." },
  { name: "Pike", type: "WEAPON", rarity: "COMMON", weight: 18, description: "Martial melee. 1d10 piercing. Heavy, reach, two-handed." },
  { name: "Rapier", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Martial melee. 1d8 piercing. Finesse." },
  { name: "Scimitar", type: "WEAPON", rarity: "COMMON", weight: 3, description: "Martial melee. 1d6 slashing. Finesse, light." },
  { name: "Shortsword", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Martial melee. 1d6 piercing. Finesse, light." },
  { name: "Trident", type: "WEAPON", rarity: "COMMON", weight: 4, description: "Martial melee. 1d6 piercing. Thrown (20/60), versatile (1d8)." },
  { name: "Warhammer", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Martial melee. 1d8 bludgeoning. Versatile (1d10)." },
  { name: "Whip", type: "WEAPON", rarity: "COMMON", weight: 3, description: "Martial melee. 1d4 slashing. Finesse, reach." },
  { name: "Hand Crossbow", type: "WEAPON", rarity: "COMMON", weight: 3, description: "Martial ranged. 1d6 piercing. Ammo (30/120), light, loading." },
  { name: "Heavy Crossbow", type: "WEAPON", rarity: "COMMON", weight: 18, description: "Martial ranged. 1d10 piercing. Ammo (100/400), heavy, loading, two-handed." },
  { name: "Longbow", type: "WEAPON", rarity: "COMMON", weight: 2, description: "Martial ranged. 1d8 piercing. Ammo (150/600), heavy, two-handed." },

  // Armor
  { name: "Padded Armor", type: "ARMOR", rarity: "COMMON", weight: 8, description: "Light. AC 11 + DEX. Disadvantage on Stealth." },
  { name: "Leather Armor", type: "ARMOR", rarity: "COMMON", weight: 10, description: "Light. AC 11 + DEX." },
  { name: "Studded Leather", type: "ARMOR", rarity: "COMMON", weight: 13, description: "Light. AC 12 + DEX." },
  { name: "Hide Armor", type: "ARMOR", rarity: "COMMON", weight: 12, description: "Medium. AC 12 + DEX (max 2)." },
  { name: "Chain Shirt", type: "ARMOR", rarity: "COMMON", weight: 20, description: "Medium. AC 13 + DEX (max 2)." },
  { name: "Scale Mail", type: "ARMOR", rarity: "COMMON", weight: 45, description: "Medium. AC 14 + DEX (max 2). Disadvantage on Stealth." },
  { name: "Breastplate", type: "ARMOR", rarity: "COMMON", weight: 20, description: "Medium. AC 14 + DEX (max 2)." },
  { name: "Half Plate", type: "ARMOR", rarity: "COMMON", weight: 40, description: "Medium. AC 15 + DEX (max 2). Disadvantage on Stealth." },
  { name: "Ring Mail", type: "ARMOR", rarity: "COMMON", weight: 40, description: "Heavy. AC 14. Disadvantage on Stealth." },
  { name: "Chain Mail", type: "ARMOR", rarity: "COMMON", weight: 55, description: "Heavy. AC 16. STR 13 required. Disadvantage on Stealth." },
  { name: "Splint Armor", type: "ARMOR", rarity: "COMMON", weight: 60, description: "Heavy. AC 17. STR 15 required. Disadvantage on Stealth." },
  { name: "Plate Armor", type: "ARMOR", rarity: "COMMON", weight: 65, description: "Heavy. AC 18. STR 15 required. Disadvantage on Stealth." },

  { name: "Shield", type: "SHIELD", rarity: "COMMON", weight: 6, description: "+2 AC. Can wield with one-handed weapon." },

  // Adventuring Gear
  { name: "Backpack", type: "MISC", rarity: "COMMON", weight: 5, description: "Holds 1 cubic foot or 30 lb of gear." },
  { name: "Bedroll", type: "MISC", rarity: "COMMON", weight: 7, description: "For sleeping outdoors." },
  { name: "Torch", type: "CONSUMABLE", rarity: "COMMON", weight: 1, description: "Bright light 20 ft, dim 20 ft more. Burns 1 hour." },
  { name: "Lantern, Hooded", type: "MISC", rarity: "COMMON", weight: 2, description: "Bright light 30 ft, dim 30 ft more. Hood dims to 5-ft dim." },
  { name: "Lantern, Bullseye", type: "MISC", rarity: "COMMON", weight: 2, description: "Bright light 60-ft cone, dim 60 ft more." },
  { name: "Oil (flask)", type: "CONSUMABLE", rarity: "COMMON", weight: 1, description: "Fuels a lantern for 6 hours. Thrown as improvised; ignite to deal 5 fire damage in 5 ft." },
  { name: "Rope, Hempen (50 ft)", type: "MISC", rarity: "COMMON", weight: 10, description: "2 HP, DC 17 STR check to burst." },
  { name: "Rope, Silk (50 ft)", type: "MISC", rarity: "COMMON", weight: 5, description: "2 HP, DC 17 STR check to burst." },
  { name: "Rations (1 day)", type: "CONSUMABLE", rarity: "COMMON", weight: 2, description: "Dry, compact food for travel." },
  { name: "Waterskin", type: "MISC", rarity: "COMMON", weight: 5, description: "Holds 4 pints of liquid. (Full = 5 lb.)" },
  { name: "Tinderbox", type: "MISC", rarity: "COMMON", weight: 1, description: "Flint, steel, and tinder for lighting fires (1 action)." },
  { name: "Crowbar", type: "TOOL", rarity: "COMMON", weight: 5, description: "Advantage on STR checks to pry things open." },
  { name: "Grappling Hook", type: "MISC", rarity: "COMMON", weight: 4, description: "Secure to a rope for climbing." },
  { name: "Manacles", type: "MISC", rarity: "COMMON", weight: 6, description: "Restrain a Small or Medium creature; DC 20 DEX check to escape." },
  { name: "Piton", type: "MISC", rarity: "COMMON", weight: 0.25, description: "Metal peg for securing ropes." },
  { name: "Spellbook", type: "MISC", rarity: "COMMON", weight: 3, description: "Wizard's book of spells. 100 pages." },
  { name: "Holy Symbol", type: "MISC", rarity: "COMMON", weight: 1, description: "Focus for divine spellcasters." },
  { name: "Component Pouch", type: "MISC", rarity: "COMMON", weight: 2, description: "Contains material components without specific cost." },
  { name: "Arcane Focus (Orb)", type: "MISC", rarity: "COMMON", weight: 3, description: "Crystal orb arcane focus." },
  { name: "Arcane Focus (Wand)", type: "MISC", rarity: "COMMON", weight: 1, description: "Wand arcane focus." },
  { name: "Arcane Focus (Staff)", type: "MISC", rarity: "COMMON", weight: 4, description: "Staff arcane focus (also a quarterstaff)." },
  { name: "Druidic Focus", type: "MISC", rarity: "COMMON", weight: 2, description: "Sprig of mistletoe, totem, or yew wand." },

  // Kits & Tools
  { name: "Healer's Kit", type: "TOOL", rarity: "COMMON", weight: 3, description: "10 uses. As an action, stabilize a 0-HP creature without a WIS (Medicine) check." },
  { name: "Thieves' Tools", type: "TOOL", rarity: "COMMON", weight: 1, description: "Lockpicks and tools for disabling traps." },
  { name: "Climber's Kit", type: "TOOL", rarity: "COMMON", weight: 12, description: "Pitons, boot tips, gloves, harness; anchor yourself while climbing." },
  { name: "Disguise Kit", type: "TOOL", rarity: "COMMON", weight: 3, description: "Cosmetics, hair dye, small props for disguise." },
  { name: "Forgery Kit", type: "TOOL", rarity: "COMMON", weight: 5, description: "Papers, inks, seals, and tools for forging documents." },
  { name: "Herbalism Kit", type: "TOOL", rarity: "COMMON", weight: 3, description: "Create Potions of Healing and antitoxins." },
  { name: "Poisoner's Kit", type: "TOOL", rarity: "UNCOMMON", weight: 2, description: "Craft and apply poisons." },
  { name: "Smith's Tools", type: "TOOL", rarity: "COMMON", weight: 8, description: "Repair and craft metal items." },

  // Consumables
  { name: "Potion of Healing", type: "CONSUMABLE", rarity: "COMMON", weight: 0.5, description: "Regain 2d4+2 HP when drunk or administered." },
  { name: "Potion of Greater Healing", type: "CONSUMABLE", rarity: "UNCOMMON", weight: 0.5, description: "Regain 4d4+4 HP." },
  { name: "Potion of Superior Healing", type: "CONSUMABLE", rarity: "RARE", weight: 0.5, description: "Regain 8d4+8 HP." },
  { name: "Potion of Supreme Healing", type: "CONSUMABLE", rarity: "VERY_RARE", weight: 0.5, description: "Regain 10d4+20 HP." },
  { name: "Antitoxin", type: "CONSUMABLE", rarity: "COMMON", weight: 0, description: "Advantage on saves against poison for 1 hour." },
  { name: "Holy Water (flask)", type: "CONSUMABLE", rarity: "COMMON", weight: 1, description: "Thrown or sprinkled; 2d6 radiant to fiends and undead." },
  { name: "Acid (vial)", type: "CONSUMABLE", rarity: "COMMON", weight: 1, description: "Ranged improvised attack; 2d6 acid damage." },
  { name: "Alchemist's Fire", type: "CONSUMABLE", rarity: "COMMON", weight: 1, description: "Ranged improvised attack; 1d4 fire each turn until DC 10 DEX check." },
  { name: "Caltrops (bag of 20)", type: "CONSUMABLE", rarity: "COMMON", weight: 2, description: "DEX save or take 1 piercing and speed halved." },
  { name: "Ball Bearings (bag of 1000)", type: "CONSUMABLE", rarity: "COMMON", weight: 2, description: "DEX save in 10-ft square or fall prone." },

  // Magic Items — common/uncommon
  { name: "Bag of Holding", type: "MISC", rarity: "UNCOMMON", weight: 15, description: "Inside: 64 cubic ft / 500 lb regardless of what's outside." },
  { name: "Cloak of Protection", type: "MISC", rarity: "UNCOMMON", weight: 1, description: "Requires attunement. +1 AC and to all saving throws." },
  { name: "Ring of Protection", type: "MISC", rarity: "RARE", weight: 0, description: "Requires attunement. +1 AC and to all saving throws." },
  { name: "Cloak of Elvenkind", type: "MISC", rarity: "UNCOMMON", weight: 1, description: "Requires attunement. Advantage on Stealth; disadvantage to perceive you." },
  { name: "Boots of Elvenkind", type: "MISC", rarity: "UNCOMMON", weight: 1, description: "Steps make no sound; advantage on Stealth (move quietly)." },
  { name: "Wand of Magic Missiles", type: "MISC", rarity: "UNCOMMON", weight: 1, description: "7 charges; cast Magic Missile (1-3 charges for 1st-3rd level). Regains 1d6+1 at dawn." },
  { name: "+1 Weapon", type: "WEAPON", rarity: "UNCOMMON", weight: 0, description: "+1 bonus to attack and damage rolls." },
  { name: "+1 Shield", type: "SHIELD", rarity: "UNCOMMON", weight: 6, description: "+1 AC beyond the normal shield bonus." },
  { name: "+1 Armor", type: "ARMOR", rarity: "RARE", weight: 0, description: "+1 AC beyond the armor's base." },
  { name: "Amulet of Health", type: "MISC", rarity: "RARE", weight: 1, description: "Requires attunement. CON becomes 19 (if lower)." },
  { name: "Gauntlets of Ogre Power", type: "MISC", rarity: "UNCOMMON", weight: 2, description: "Requires attunement. STR becomes 19 (if lower)." },
  { name: "Immovable Rod", type: "MISC", rarity: "UNCOMMON", weight: 2, description: "Button fixes rod in place; holds up to 8,000 lb." },
  { name: "Driftglobe", type: "MISC", rarity: "UNCOMMON", weight: 1, description: "Command word: light or daylight. Follows you at 30 ft." },

  // Treasure
  { name: "Gold Coins", type: "TREASURE", rarity: "COMMON", weight: 0.02, description: "Standard currency. 50 coins = 1 lb." },
  { name: "Gemstone (10 gp)", type: "TREASURE", rarity: "COMMON", weight: 0, description: "Semi-precious stone." },
  { name: "Gemstone (50 gp)", type: "TREASURE", rarity: "UNCOMMON", weight: 0, description: "Quality gem." },
  { name: "Gemstone (100 gp)", type: "TREASURE", rarity: "UNCOMMON", weight: 0, description: "Rare gem such as an amethyst or garnet." },
];
