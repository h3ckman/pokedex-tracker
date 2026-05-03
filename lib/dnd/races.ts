export type RaceDef = {
  name: string;
  speed: number;
  subraces: readonly string[];
};

export const RACES: readonly RaceDef[] = [
  { name: "Human", speed: 30, subraces: ["Standard", "Variant"] },
  { name: "Elf", speed: 30, subraces: ["High Elf", "Wood Elf", "Drow", "Sea Elf", "Shadar-kai", "Eladrin"] },
  { name: "Dwarf", speed: 25, subraces: ["Hill Dwarf", "Mountain Dwarf", "Duergar"] },
  { name: "Halfling", speed: 25, subraces: ["Lightfoot", "Stout", "Ghostwise"] },
  { name: "Dragonborn", speed: 30, subraces: ["Black", "Blue", "Brass", "Bronze", "Copper", "Gold", "Green", "Red", "Silver", "White"] },
  { name: "Gnome", speed: 25, subraces: ["Forest Gnome", "Rock Gnome", "Deep Gnome"] },
  { name: "Half-Elf", speed: 30, subraces: [] },
  { name: "Half-Orc", speed: 30, subraces: [] },
  { name: "Tiefling", speed: 30, subraces: ["Asmodeus", "Baalzebul", "Dispater", "Fierna", "Glasya", "Levistus", "Mammon", "Mephistopheles", "Zariel"] },
  { name: "Aarakocra", speed: 25, subraces: [] },
  { name: "Aasimar", speed: 30, subraces: ["Protector", "Scourge", "Fallen"] },
  { name: "Firbolg", speed: 30, subraces: [] },
  { name: "Genasi", speed: 30, subraces: ["Air", "Earth", "Fire", "Water"] },
  { name: "Goliath", speed: 30, subraces: [] },
  { name: "Kenku", speed: 30, subraces: [] },
  { name: "Lizardfolk", speed: 30, subraces: [] },
  { name: "Tabaxi", speed: 30, subraces: [] },
  { name: "Triton", speed: 30, subraces: [] },
  { name: "Yuan-ti Pureblood", speed: 30, subraces: [] },
  { name: "Goblin", speed: 30, subraces: [] },
  { name: "Hobgoblin", speed: 30, subraces: [] },
  { name: "Kobold", speed: 30, subraces: [] },
  { name: "Orc", speed: 30, subraces: [] },
];

export const RACE_NAMES = RACES.map((r) => r.name);

export function getRace(name: string): RaceDef | undefined {
  return RACES.find((r) => r.name === name);
}
