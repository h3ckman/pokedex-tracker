const FIRST_NAMES = [
  "Aelric", "Bryn", "Cael", "Dara", "Eira", "Fenn", "Gwyn", "Hale",
  "Iris", "Jorin", "Kael", "Lina", "Mira", "Nyx", "Orin", "Perrin",
  "Quill", "Rhea", "Soren", "Tova", "Ulric", "Vesna", "Wren", "Xara",
  "Ysolde", "Zara", "Brynja", "Caelum", "Doric", "Elara", "Fionn",
  "Galen", "Hadeon", "Isolde", "Jareth", "Kira", "Lyra", "Mael",
  "Nessa", "Owyn", "Pyria", "Riven", "Sable", "Thorne", "Una",
];

const SURNAMES = [
  "Brightaxe", "Stormwind", "Thornfield", "Ashford", "Ironvale",
  "Silverleaf", "Blackwood", "Riverstone", "Northgale", "Duskweaver",
  "Emberlight", "Frosthold", "Shadowmere", "Wildmoor", "Stormvale",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomCharacterName(): string {
  return `${pick(FIRST_NAMES)} ${pick(SURNAMES)}`;
}
