import type { GameSystem, Region } from "@/lib/generated/prisma/client";

export type SidebarPokemon = {
  id: string;
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string | null;
  entries: { gameSystem: GameSystem }[];
  seen?: boolean;
  caught?: boolean;
};

export type ViewMode = "pokedex" | "alphabetical" | "region" | "game-system";

export type PokemonGroup = {
  key: string;
  label: string;
  pokemon: SidebarPokemon[];
};

const POKEDEX_BUCKET_SIZE = 50;

const REGION_ORDER: Region[] = [
  "KANTO",
  "JOHTO",
  "HOENN",
  "SINNOH",
  "UNOVA",
  "KALOS",
  "ALOLA",
  "GALAR",
  "PALDEA",
];

const REGION_LABEL: Record<Region, string> = {
  KANTO: "Kanto",
  JOHTO: "Johto",
  HOENN: "Hoenn",
  SINNOH: "Sinnoh",
  UNOVA: "Unova",
  KALOS: "Kalos",
  ALOLA: "Alola",
  GALAR: "Galar",
  PALDEA: "Paldea",
};

const SYSTEM_ORDER: GameSystem[] = [
  "GAME_BOY",
  "GAME_BOY_COLOR",
  "GAME_BOY_ADVANCE",
  "NINTENDO_DS",
  "NINTENDO_3DS",
  "NINTENDO_SWITCH",
];

const SYSTEM_LABEL: Record<GameSystem, string> = {
  GAME_BOY: "Game Boy",
  GAME_BOY_COLOR: "Game Boy Color",
  GAME_BOY_ADVANCE: "Game Boy Advance",
  NINTENDO_DS: "Nintendo DS",
  NINTENDO_3DS: "Nintendo 3DS",
  NINTENDO_SWITCH: "Nintendo Switch",
};

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

export function filterPokemon(
  pokemon: SidebarPokemon[],
  query: string,
): SidebarPokemon[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return pokemon;
  const dexQ = q.replace(/^#/, "");
  const isNumeric = /^\d+$/.test(dexQ);
  return pokemon.filter((p) => {
    if (p.name.toLowerCase().includes(q)) return true;
    if (isNumeric && String(p.nationalDexNumber).startsWith(dexQ)) return true;
    return false;
  });
}

function groupByPokedex(pokemon: SidebarPokemon[]): PokemonGroup[] {
  const buckets = new Map<number, SidebarPokemon[]>();
  for (const p of pokemon) {
    const idx = Math.floor((p.nationalDexNumber - 1) / POKEDEX_BUCKET_SIZE);
    const list = buckets.get(idx) ?? [];
    list.push(p);
    buckets.set(idx, list);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([idx, list]) => {
      const start = idx * POKEDEX_BUCKET_SIZE + 1;
      const end = start + POKEDEX_BUCKET_SIZE - 1;
      return {
        key: `pokedex:${idx}`,
        label: `#${pad4(start)} – #${pad4(end)}`,
        pokemon: list.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber),
      };
    });
}

function groupByAlphabetical(pokemon: SidebarPokemon[]): PokemonGroup[] {
  const buckets = new Map<string, SidebarPokemon[]>();
  for (const p of pokemon) {
    const letter = (p.name[0] ?? "#").toUpperCase();
    const list = buckets.get(letter) ?? [];
    list.push(p);
    buckets.set(letter, list);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, list]) => ({
      key: `alpha:${letter}`,
      label: letter,
      pokemon: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

function groupByRegion(pokemon: SidebarPokemon[]): PokemonGroup[] {
  const buckets = new Map<Region, SidebarPokemon[]>();
  for (const p of pokemon) {
    const list = buckets.get(p.region) ?? [];
    list.push(p);
    buckets.set(p.region, list);
  }
  return REGION_ORDER.filter((r) => buckets.has(r)).map((r) => ({
    key: `region:${r}`,
    label: REGION_LABEL[r],
    pokemon: (buckets.get(r) ?? []).sort(
      (a, b) => a.nationalDexNumber - b.nationalDexNumber,
    ),
  }));
}

function groupByGameSystem(pokemon: SidebarPokemon[]): PokemonGroup[] {
  const buckets = new Map<GameSystem, SidebarPokemon[]>();
  for (const p of pokemon) {
    const seen = new Set<GameSystem>();
    for (const e of p.entries) {
      if (seen.has(e.gameSystem)) continue;
      seen.add(e.gameSystem);
      const list = buckets.get(e.gameSystem) ?? [];
      list.push(p);
      buckets.set(e.gameSystem, list);
    }
  }
  return SYSTEM_ORDER.filter((s) => buckets.has(s)).map((s) => ({
    key: `system:${s}`,
    label: SYSTEM_LABEL[s],
    pokemon: (buckets.get(s) ?? []).sort(
      (a, b) => a.nationalDexNumber - b.nationalDexNumber,
    ),
  }));
}

export function groupPokemon(
  pokemon: SidebarPokemon[],
  mode: ViewMode,
): PokemonGroup[] {
  switch (mode) {
    case "pokedex":
      return groupByPokedex(pokemon);
    case "alphabetical":
      return groupByAlphabetical(pokemon);
    case "region":
      return groupByRegion(pokemon);
    case "game-system":
      return groupByGameSystem(pokemon);
  }
}
