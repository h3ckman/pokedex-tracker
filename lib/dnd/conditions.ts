export type ConditionDef = {
  name: string;
  hasLevels?: boolean;
  description: string;
};

export const CONDITIONS: readonly ConditionDef[] = [
  { name: "Blinded", description: "Can't see; auto-fail sight checks. Attacks against have advantage; your attacks have disadvantage." },
  { name: "Charmed", description: "Can't attack the charmer or target them with harmful abilities/magical effects. Charmer has advantage on social checks." },
  { name: "Deafened", description: "Can't hear and auto-fails hearing checks." },
  { name: "Frightened", description: "Disadvantage on ability checks and attacks while source of fear is in line of sight. Can't willingly move closer to source." },
  { name: "Grappled", description: "Speed becomes 0. Ends if grappler is incapacitated or you're moved out of reach." },
  { name: "Incapacitated", description: "Can't take actions or reactions." },
  { name: "Invisible", description: "Impossible to see without magic/special sense. Attacks against have disadvantage; your attacks have advantage." },
  { name: "Paralyzed", description: "Incapacitated; can't move or speak; auto-fail STR/DEX saves. Attacks vs. you have advantage. Melee hits within 5 ft are crits." },
  { name: "Petrified", description: "Transformed to stone; incapacitated; weight ×10; resistant to all damage; immune to poison/disease." },
  { name: "Poisoned", description: "Disadvantage on attack rolls and ability checks." },
  { name: "Prone", description: "Only movement is to crawl. Disadvantage on attacks. Melee attacks vs you have advantage; ranged have disadvantage." },
  { name: "Restrained", description: "Speed becomes 0. Attacks vs you have advantage; your attacks have disadvantage. Disadvantage on DEX saves." },
  { name: "Stunned", description: "Incapacitated; can't move; can speak only falteringly. Auto-fail STR/DEX saves. Attacks vs you have advantage." },
  { name: "Unconscious", description: "Incapacitated; can't move/speak; unaware of surroundings; drop what's held; fall prone. Auto-fail STR/DEX saves. Melee hits within 5 ft are crits." },
  {
    name: "Exhaustion",
    hasLevels: true,
    description: "Stacks 1-6. 1: disadv ability checks. 2: speed halved. 3: disadv attacks/saves. 4: HP max halved. 5: speed 0. 6: death.",
  },
];

export const CONDITION_NAMES = CONDITIONS.map((c) => c.name);
