import type { SpellSchool } from "@/lib/generated/prisma/client";

export type CatalogSpell = {
  name: string;
  level: number;
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
};

export const SPELL_CATALOG: readonly CatalogSpell[] = [
  // Cantrips
  {
    name: "Dancing Lights",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S, M (phosphorus, wychwood, or glowworm)",
    duration: "Concentration, up to 1 minute",
    description:
      "Create up to four torch-sized lights within range as floating glowing orbs. Move them up to 60 ft as a bonus action.",
  },
  {
    name: "Druidcraft",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Predict weather for 24 hours, bloom a flower, create a sensory effect, or light/snuff out a small flame.",
  },
  {
    name: "Eldritch Blast",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "A beam of crackling energy. Ranged spell attack; on hit, 1d10 force damage. Extra beams at 5th/11th/17th.",
  },
  {
    name: "Fire Bolt",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Ranged spell attack; on hit, 1d10 fire damage. Unattended flammable objects ignite. Scales with level.",
  },
  {
    name: "Guidance",
    level: 0,
    school: "DIVINATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S",
    duration: "Concentration, up to 1 minute",
    description:
      "Target adds 1d4 to one ability check of their choice before the spell ends.",
  },
  {
    name: "Light",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, M (a firefly or phosphorescent moss)",
    duration: "1 hour",
    description:
      "Object sheds bright light in a 20-ft radius and dim light for 20 more. DEX save to avoid on unwilling creature.",
  },
  {
    name: "Mage Hand",
    level: 0,
    school: "CONJURATION",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S",
    duration: "1 minute",
    description:
      "A spectral hand manipulates objects, opens unlocked doors, or carries items weighing up to 10 lb.",
  },
  {
    name: "Mending",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 minute",
    range: "Touch",
    components: "V, S, M (two lodestones)",
    duration: "Instantaneous",
    description:
      "Repair a single break or tear in an object, provided the break is no larger than 1 ft in any dimension.",
  },
  {
    name: "Message",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S, M (a short piece of copper wire)",
    duration: "1 round",
    description:
      "Whisper a message to a creature you can see; they can reply in a whisper only you hear.",
  },
  {
    name: "Minor Illusion",
    level: 0,
    school: "ILLUSION",
    castingTime: "1 action",
    range: "30 feet",
    components: "S, M (a bit of fleece)",
    duration: "1 minute",
    description:
      "Create a sound or an image of an object within range. Investigation check vs spell save DC to disbelieve.",
  },
  {
    name: "Poison Spray",
    level: 0,
    school: "CONJURATION",
    castingTime: "1 action",
    range: "10 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Target must succeed on a CON save or take 1d12 poison damage. Scales with level.",
  },
  {
    name: "Prestidigitation",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "10 feet",
    components: "V, S",
    duration: "Up to 1 hour",
    description:
      "Minor magical trick: light/snuff flame, clean/soil, flavor food, create trinket, etc.",
  },
  {
    name: "Ray of Frost",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Ranged spell attack; on hit, 1d8 cold damage and target's speed reduced by 10 ft until your next turn.",
  },
  {
    name: "Sacred Flame",
    level: 0,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Flame-like radiance descends. DEX save or 1d8 radiant damage. Target gains no cover benefits.",
  },
  {
    name: "Shillelagh",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 bonus action",
    range: "Touch",
    components: "V, S, M (mistletoe, shamrock leaf, and club/quarterstaff)",
    duration: "1 minute",
    description:
      "Club/quarterstaff uses your spellcasting ability for attack and damage rolls; deals 1d8 bludgeoning.",
  },
  {
    name: "Spare the Dying",
    level: 0,
    school: "NECROMANCY",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Stabilize a creature at 0 HP that isn't dead. No effect on undead or constructs.",
  },
  {
    name: "Thaumaturgy",
    level: 0,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "30 feet",
    components: "V",
    duration: "Up to 1 minute",
    description:
      "Minor wonder: boom voice, flame flickers, tremors, sounds, flung doors/windows, eye color.",
  },
  {
    name: "Vicious Mockery",
    level: 0,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description:
      "Target WIS save or take 1d4 psychic damage and disadvantage on next attack roll before end of its next turn.",
  },

  // Level 1
  {
    name: "Bless",
    level: 1,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S, M (a sprinkling of holy water)",
    duration: "Concentration, up to 1 minute",
    description:
      "Up to 3 creatures add 1d4 to attack rolls and saving throws.",
  },
  {
    name: "Burning Hands",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Self (15-ft cone)",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Each creature in cone makes DEX save; 3d6 fire damage (half on success). Ignites unattended flammables.",
  },
  {
    name: "Charm Person",
    level: 1,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S",
    duration: "1 hour",
    description:
      "Humanoid WIS save (advantage if in combat) or is charmed. Knows it was charmed afterward.",
  },
  {
    name: "Cure Wounds",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Creature regains HP equal to 1d8 + spellcasting modifier. +1d8 per slot level above 1st.",
  },
  {
    name: "Detect Magic",
    level: 1,
    school: "DIVINATION",
    castingTime: "1 action (ritual)",
    range: "Self",
    components: "V, S",
    duration: "Concentration, up to 10 minutes",
    description:
      "Sense presence of magic within 30 ft; action to see faint aura around magical objects/creatures.",
  },
  {
    name: "Faerie Fire",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Concentration, up to 1 minute",
    description:
      "Objects/creatures in 20-ft cube outlined. DEX save negates. Advantage on attacks against; invisibles lose benefit.",
  },
  {
    name: "Healing Word",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 bonus action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description:
      "Target regains 1d4 + spellcasting mod HP. +1d4 per slot level above 1st.",
  },
  {
    name: "Mage Armor",
    level: 1,
    school: "ABJURATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (a piece of cured leather)",
    duration: "8 hours",
    description:
      "Willing creature not wearing armor has base AC = 13 + DEX mod.",
  },
  {
    name: "Magic Missile",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Three darts of force, each 1d4+1 force damage. Auto-hit. +1 dart per slot above 1st.",
  },
  {
    name: "Shield",
    level: 1,
    school: "ABJURATION",
    castingTime: "1 reaction",
    range: "Self",
    components: "V, S",
    duration: "1 round",
    description:
      "+5 AC until start of your next turn; no damage from Magic Missile.",
  },
  {
    name: "Sleep",
    level: 1,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "90 feet",
    components: "V, S, M (fine sand, rose petals, or a cricket)",
    duration: "1 minute",
    description:
      "5d8 HP worth of creatures (lowest first) fall unconscious. Undead and charm-immune unaffected.",
  },
  {
    name: "Thunderwave",
    level: 1,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Self (15-ft cube)",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "CON save; 2d8 thunder damage and pushed 10 ft (half damage, no push on success).",
  },

  // Level 2
  {
    name: "Aid",
    level: 2,
    school: "ABJURATION",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S, M (a tiny strip of white cloth)",
    duration: "8 hours",
    description: "Up to 3 creatures' HP maximum and current HP increase by 5.",
  },
  {
    name: "Hold Person",
    level: 2,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (a small, straight piece of iron)",
    duration: "Concentration, up to 1 minute",
    description:
      "Humanoid WIS save or paralyzed. Repeats save each turn. Affect more at higher levels.",
  },
  {
    name: "Invisibility",
    level: 2,
    school: "ILLUSION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (an eyelash in gum arabic)",
    duration: "Concentration, up to 1 hour",
    description:
      "Target invisible until they attack or cast. +1 creature per slot above 2nd.",
  },
  {
    name: "Misty Step",
    level: 2,
    school: "CONJURATION",
    castingTime: "1 bonus action",
    range: "Self",
    components: "V",
    duration: "Instantaneous",
    description: "Teleport up to 30 ft to an unoccupied space you can see.",
  },
  {
    name: "Scorching Ray",
    level: 2,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Three rays; each ranged spell attack for 2d6 fire damage. +1 ray per slot above 2nd.",
  },
  {
    name: "Spiritual Weapon",
    level: 2,
    school: "EVOCATION",
    castingTime: "1 bonus action",
    range: "60 feet",
    components: "V, S",
    duration: "1 minute",
    description:
      "Summon a floating weapon; bonus action to attack for 1d8 + spell mod force damage.",
  },
  {
    name: "Web",
    level: 2,
    school: "CONJURATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (a bit of spiderweb)",
    duration: "Concentration, up to 1 hour",
    description:
      "20-ft cube of webs. DEX save or restrained. Difficult terrain, flammable.",
  },

  // Level 3
  {
    name: "Counterspell",
    level: 3,
    school: "ABJURATION",
    castingTime: "1 reaction",
    range: "60 feet",
    components: "S",
    duration: "Instantaneous",
    description:
      "Interrupt a spell of 3rd level or lower. Higher-level spells require an ability check.",
  },
  {
    name: "Dispel Magic",
    level: 3,
    school: "ABJURATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "End spells of 3rd level or lower. Higher-level: ability check DC 10 + spell level.",
  },
  {
    name: "Fireball",
    level: 3,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "150 feet",
    components: "V, S, M (tiny ball of bat guano and sulfur)",
    duration: "Instantaneous",
    description:
      "20-ft radius sphere. DEX save; 8d6 fire (half on save). +1d6 per slot above 3rd.",
  },
  {
    name: "Fly",
    level: 3,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (a wing feather)",
    duration: "Concentration, up to 10 minutes",
    description: "Target gains flying speed of 60 ft. +1 creature per slot above 3rd.",
  },
  {
    name: "Haste",
    level: 3,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S, M (shaving of licorice root)",
    duration: "Concentration, up to 1 minute",
    description:
      "Speed doubled, +2 AC, adv on DEX saves, extra action. Lethargy for 1 round when it ends.",
  },
  {
    name: "Hypnotic Pattern",
    level: 3,
    school: "ILLUSION",
    castingTime: "1 action",
    range: "120 feet",
    components: "S, M (a glowing stick of incense)",
    duration: "Concentration, up to 1 minute",
    description:
      "30-ft cube. WIS save or charmed and incapacitated, speed 0. Breaks on damage.",
  },
  {
    name: "Lightning Bolt",
    level: 3,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Self (100-ft line)",
    components: "V, S, M (fur and a rod of amber, crystal, or glass)",
    duration: "Instantaneous",
    description: "DEX save; 8d6 lightning (half on save). +1d6 per slot above 3rd.",
  },
  {
    name: "Revivify",
    level: 3,
    school: "NECROMANCY",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (diamonds worth 300 gp, consumed)",
    duration: "Instantaneous",
    description:
      "Return a creature dead less than 1 minute to life with 1 HP.",
  },

  // Level 4
  {
    name: "Banishment",
    level: 4,
    school: "ABJURATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (an item distasteful to the target)",
    duration: "Concentration, up to 1 minute",
    description:
      "Target CHA save or banished to harmless demiplane. Permanent if not native plane.",
  },
  {
    name: "Dimension Door",
    level: 4,
    school: "CONJURATION",
    castingTime: "1 action",
    range: "500 feet",
    components: "V",
    duration: "Instantaneous",
    description:
      "Teleport yourself and one willing creature up to 500 ft.",
  },
  {
    name: "Polymorph",
    level: 4,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (a caterpillar cocoon)",
    duration: "Concentration, up to 1 hour",
    description:
      "Transform target into a beast of lower CR. WIS save negates (unwilling).",
  },
  {
    name: "Wall of Fire",
    level: 4,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S, M (phosphorus)",
    duration: "Concentration, up to 1 minute",
    description:
      "60-ft wall; DEX save or 5d8 fire. Creatures on hot side take 5d8 passing through.",
  },

  // Level 5
  {
    name: "Cone of Cold",
    level: 5,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "Self (60-ft cone)",
    components: "V, S, M (small crystal or glass cone)",
    duration: "Instantaneous",
    description: "CON save; 8d8 cold damage (half on save).",
  },
  {
    name: "Greater Restoration",
    level: 5,
    school: "ABJURATION",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (diamond dust worth 100 gp, consumed)",
    duration: "Instantaneous",
    description:
      "End one condition (charmed, petrified, exhaustion level, etc.) or reduce max HP curse.",
  },
  {
    name: "Hold Monster",
    level: 5,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "90 feet",
    components: "V, S, M (a small, straight piece of iron)",
    duration: "Concentration, up to 1 minute",
    description:
      "WIS save or paralyzed. Doesn't work on undead.",
  },
  {
    name: "Wall of Force",
    level: 5,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S, M (a pinch of powder made of diamond)",
    duration: "Concentration, up to 10 minutes",
    description:
      "Invisible wall; ten 10-ft panels or 10-ft-radius sphere. Nothing can pass through.",
  },

  // Level 6-9
  {
    name: "Chain Lightning",
    level: 6,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "150 feet",
    components: "V, S, M (silver pin, fur, glass rod)",
    duration: "Instantaneous",
    description:
      "Primary + up to 3 secondary targets within 30 ft; DEX save; 10d8 lightning (half on save).",
  },
  {
    name: "Disintegrate",
    level: 6,
    school: "TRANSMUTATION",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (lodestone and dust)",
    duration: "Instantaneous",
    description:
      "DEX save; 10d6 + 40 force damage. If reduced to 0 HP, target disintegrates.",
  },
  {
    name: "Finger of Death",
    level: 7,
    school: "NECROMANCY",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: "CON save; 7d8+30 necrotic. If killed, rises as zombie under your control.",
  },
  {
    name: "Power Word Stun",
    level: 8,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description:
      "Target with 150 HP or fewer is stunned. Repeats CON save each turn.",
  },
  {
    name: "Meteor Swarm",
    level: 9,
    school: "EVOCATION",
    castingTime: "1 action",
    range: "1 mile",
    components: "V, S",
    duration: "Instantaneous",
    description:
      "Four 40-ft spheres. DEX save; 20d6 fire + 20d6 bludgeoning (half on save).",
  },
  {
    name: "Power Word Kill",
    level: 9,
    school: "ENCHANTMENT",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description: "Target with 100 HP or fewer dies. No save.",
  },
  {
    name: "Wish",
    level: 9,
    school: "CONJURATION",
    castingTime: "1 action",
    range: "Self",
    components: "V",
    duration: "Instantaneous",
    description:
      "Duplicate any 8th-level or lower spell without components, or bend reality. Beware the stress.",
  },
];
