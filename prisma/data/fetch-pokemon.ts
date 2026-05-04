import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Region =
  | "KANTO"
  | "JOHTO"
  | "HOENN"
  | "SINNOH"
  | "UNOVA"
  | "KALOS"
  | "ALOLA"
  | "GALAR"
  | "PALDEA";

type FlavorText = { version: string; text: string };

type PokemonRow = {
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string;
  artworkUrl: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  genus: string | null;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  flavorTexts: FlavorText[];
};

const TOTAL = 1000;
const BATCH_SIZE = 25;

const GENERATION_BY_NAME: Record<string, { generation: number; region: Region }> = {
  "generation-i": { generation: 1, region: "KANTO" },
  "generation-ii": { generation: 2, region: "JOHTO" },
  "generation-iii": { generation: 3, region: "HOENN" },
  "generation-iv": { generation: 4, region: "SINNOH" },
  "generation-v": { generation: 5, region: "UNOVA" },
  "generation-vi": { generation: 6, region: "KALOS" },
  "generation-vii": { generation: 7, region: "ALOLA" },
  "generation-viii": { generation: 8, region: "GALAR" },
  "generation-ix": { generation: 9, region: "PALDEA" },
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function normalizeFlavor(text: string): string {
  return text.replace(/\f|\n|\r|­/g, " ").replace(/\s+/g, " ").trim();
}

type SpeciesResponse = {
  id: number;
  name: string;
  generation: { name: string };
  genera: { genus: string; language: { name: string } }[];
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
};

type PokemonResponse = {
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

async function fetchOne(id: number): Promise<PokemonRow> {
  const [speciesRes, pokemonRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
  ]);
  if (!speciesRes.ok) throw new Error(`species ${id} ${speciesRes.status}`);
  if (!pokemonRes.ok) throw new Error(`pokemon ${id} ${pokemonRes.status}`);
  const species = (await speciesRes.json()) as SpeciesResponse;
  const pokemon = (await pokemonRes.json()) as PokemonResponse;

  const gen = GENERATION_BY_NAME[species.generation.name];
  if (!gen) throw new Error(`Unknown generation for #${id}: ${species.generation.name}`);

  const englishGenus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? null;

  const seenVersions = new Set<string>();
  const flavorTexts: FlavorText[] = [];
  for (const entry of species.flavor_text_entries) {
    if (entry.language.name !== "en") continue;
    if (seenVersions.has(entry.version.name)) continue;
    seenVersions.add(entry.version.name);
    flavorTexts.push({
      version: entry.version.name,
      text: normalizeFlavor(entry.flavor_text),
    });
  }

  const statByName = new Map(
    pokemon.stats.map((s) => [s.stat.name, s.base_stat]),
  );

  return {
    nationalDexNumber: species.id,
    name: titleCase(species.name),
    generation: gen.generation,
    region: gen.region,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.id}.png`,
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.id}.png`,
    types: pokemon.types.map((t) => t.type.name.toUpperCase()),
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map((a) =>
      titleCase(a.ability.name) + (a.is_hidden ? " (Hidden)" : ""),
    ),
    genus: englishGenus,
    hp: statByName.get("hp") ?? 0,
    attack: statByName.get("attack") ?? 0,
    defense: statByName.get("defense") ?? 0,
    specialAttack: statByName.get("special-attack") ?? 0,
    specialDefense: statByName.get("special-defense") ?? 0,
    speed: statByName.get("speed") ?? 0,
    flavorTexts,
  };
}

async function main(): Promise<void> {
  const out: PokemonRow[] = [];
  for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
    const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const rows = await Promise.all(ids.map(fetchOne));
    out.push(...rows);
    console.log(`Fetched ${end}/${TOTAL}`);
  }
  out.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  const target = join(process.cwd(), "prisma/data/pokemon.json");
  writeFileSync(target, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${out.length} rows to ${target}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
