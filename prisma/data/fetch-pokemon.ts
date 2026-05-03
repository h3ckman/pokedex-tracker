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

type PokemonRow = {
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string;
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

async function fetchOne(id: number): Promise<PokemonRow> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) throw new Error(`Failed ${id}: ${res.status}`);
  const data = (await res.json()) as {
    id: number;
    name: string;
    generation: { name: string };
  };
  const gen = GENERATION_BY_NAME[data.generation.name];
  if (!gen) throw new Error(`Unknown generation for #${id}: ${data.generation.name}`);
  return {
    nationalDexNumber: data.id,
    name: titleCase(data.name),
    generation: gen.generation,
    region: gen.region,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
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
