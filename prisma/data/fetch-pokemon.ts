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

type EvolutionTrigger = "LEVEL_UP" | "USE_ITEM" | "TRADE" | "SHED" | "OTHER";

const TYPE_NAMES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
  "dragon", "dark", "steel", "fairy",
] as const;

type TypeName = (typeof TYPE_NAMES)[number];

type PokemonRow = {
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string;
  artworkUrl: string;
  shinyArtworkUrl: string;
  animatedSpriteUrl: string;
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
  evHp: number;
  evAttack: number;
  evDefense: number;
  evSpecialAttack: number;
  evSpecialDefense: number;
  evSpeed: number;
  weaknesses4x: string[];
  weaknesses2x: string[];
  resistances1_2: string[];
  resistances1_4: string[];
  immunities: string[];
  captureRate: number | null;
  baseHappiness: number | null;
  growthRate: string | null;
  eggGroups: string[];
  genderRate: number | null;
  hatchCounter: number | null;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  habitat: string | null;
  shape: string | null;
  dexColor: string | null;
  flavorTexts: FlavorText[];
  evolutionChainRootDex: number | null;
  evolvesFromDexNumber: number | null;
  evolutionTrigger: EvolutionTrigger | null;
  evolutionTriggerLabel: string | null;
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

function titleCaseSpaced(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  evolution_chain: { url: string };
  capture_rate: number;
  base_happiness: number | null;
  growth_rate: { name: string } | null;
  egg_groups: { name: string }[];
  gender_rate: number;
  hatch_counter: number | null;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  habitat: { name: string } | null;
  shape: { name: string } | null;
  color: { name: string } | null;
};

type PokemonResponse = {
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: { name: string };
  }[];
};

type DamageRelations = {
  double_damage_from: { name: string }[];
  half_damage_from: { name: string }[];
  no_damage_from: { name: string }[];
};

type TypeResponse = { name: string; damage_relations: DamageRelations };

type NamedRef = { name: string; url: string } | null;

type EvolutionDetail = {
  trigger: { name: string } | null;
  min_level: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  time_of_day: string;
  gender: number | null;
  item: NamedRef;
  held_item: NamedRef;
  known_move: NamedRef;
  known_move_type: NamedRef;
  location: NamedRef;
  needs_overworld_rain: boolean;
  party_species: NamedRef;
  party_type: NamedRef;
  relative_physical_stats: number | null;
  trade_species: NamedRef;
  turn_upside_down: boolean;
};

type ChainLink = {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
};

type ChainResponse = {
  id: number;
  chain: ChainLink;
};

type ChainEntry = {
  rootDex: number;
  evolvesFromDexNumber: number | null;
  trigger: EvolutionTrigger | null;
  triggerLabel: string | null;
};

const chainCache = new Map<number, ChainResponse>();

async function loadTypeChart(): Promise<Map<TypeName, DamageRelations>> {
  const entries = await Promise.all(
    TYPE_NAMES.map(async (name) => {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${name}`);
      if (!res.ok) throw new Error(`type ${name} ${res.status}`);
      const data = (await res.json()) as TypeResponse;
      return [name, data.damage_relations] as const;
    }),
  );
  return new Map(entries);
}

type Bucket = "weaknesses4x" | "weaknesses2x" | "resistances1_2" | "resistances1_4" | "immunities";

function computeMatchups(
  defenderTypes: TypeName[],
  chart: Map<TypeName, DamageRelations>,
): Record<Bucket, string[]> {
  const buckets: Record<Bucket, string[]> = {
    weaknesses4x: [],
    weaknesses2x: [],
    resistances1_2: [],
    resistances1_4: [],
    immunities: [],
  };
  for (const attacker of TYPE_NAMES) {
    let multiplier = 1;
    for (const defender of defenderTypes) {
      const rel = chart.get(defender);
      if (!rel) continue;
      if (rel.no_damage_from.some((t) => t.name === attacker)) {
        multiplier = 0;
        break;
      }
      if (rel.double_damage_from.some((t) => t.name === attacker)) multiplier *= 2;
      if (rel.half_damage_from.some((t) => t.name === attacker)) multiplier *= 0.5;
    }
    const upper = attacker.toUpperCase();
    if (multiplier === 0) buckets.immunities.push(upper);
    else if (multiplier === 4) buckets.weaknesses4x.push(upper);
    else if (multiplier === 2) buckets.weaknesses2x.push(upper);
    else if (multiplier === 0.5) buckets.resistances1_2.push(upper);
    else if (multiplier === 0.25) buckets.resistances1_4.push(upper);
  }
  for (const key of Object.keys(buckets) as Bucket[]) {
    buckets[key].sort();
  }
  return buckets;
}

function speciesIdFromUrl(url: string): number | null {
  const match = url.match(/\/pokemon-species\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

function chainIdFromUrl(url: string): number | null {
  const match = url.match(/\/evolution-chain\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

async function fetchChain(id: number): Promise<ChainResponse> {
  const cached = chainCache.get(id);
  if (cached) return cached;
  const res = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}`);
  if (!res.ok) throw new Error(`evolution-chain ${id} ${res.status}`);
  const data = (await res.json()) as ChainResponse;
  chainCache.set(id, data);
  return data;
}

function formatTrigger(
  detail: EvolutionDetail,
): { trigger: EvolutionTrigger; label: string } {
  const triggerName = detail.trigger?.name ?? "";

  if (triggerName === "level-up") {
    if (detail.min_happiness != null) {
      return { trigger: "LEVEL_UP", label: "Friendship" };
    }
    if (detail.known_move_type) {
      return {
        trigger: "LEVEL_UP",
        label: `Lvl up (knows ${titleCaseSpaced(detail.known_move_type.name)})`,
      };
    }
    if (detail.known_move) {
      return {
        trigger: "LEVEL_UP",
        label: `Lvl up (${titleCaseSpaced(detail.known_move.name)})`,
      };
    }
    if (detail.time_of_day) {
      return { trigger: "LEVEL_UP", label: `Lvl up (${detail.time_of_day})` };
    }
    if (detail.location) {
      return {
        trigger: "LEVEL_UP",
        label: `Lvl up @ ${titleCaseSpaced(detail.location.name)}`,
      };
    }
    if (detail.held_item) {
      return {
        trigger: "LEVEL_UP",
        label: `Lvl up holding ${titleCaseSpaced(detail.held_item.name)}`,
      };
    }
    if (detail.min_level != null) {
      return { trigger: "LEVEL_UP", label: `Lvl ${detail.min_level}` };
    }
    if (detail.min_affection != null) {
      return { trigger: "LEVEL_UP", label: "Affection" };
    }
    if (detail.min_beauty != null) {
      return { trigger: "LEVEL_UP", label: "Beauty" };
    }
    return { trigger: "LEVEL_UP", label: "Level up" };
  }

  if (triggerName === "trade") {
    if (detail.held_item) {
      return {
        trigger: "TRADE",
        label: `Trade w/ ${titleCaseSpaced(detail.held_item.name)}`,
      };
    }
    if (detail.trade_species) {
      return {
        trigger: "TRADE",
        label: `Trade for ${titleCaseSpaced(detail.trade_species.name)}`,
      };
    }
    return { trigger: "TRADE", label: "Trade" };
  }

  if (triggerName === "use-item") {
    if (detail.item) {
      return { trigger: "USE_ITEM", label: titleCaseSpaced(detail.item.name) };
    }
    return { trigger: "USE_ITEM", label: "Use item" };
  }

  if (triggerName === "shed") {
    return { trigger: "SHED", label: "Shed" };
  }

  if (triggerName) {
    return { trigger: "OTHER", label: titleCaseSpaced(triggerName) };
  }
  return { trigger: "OTHER", label: "Special" };
}

function walkChain(chain: ChainResponse, totalSpecies: number): Map<number, ChainEntry> {
  const result = new Map<number, ChainEntry>();
  const maybeRoot = speciesIdFromUrl(chain.chain.species.url);
  if (maybeRoot == null || maybeRoot > totalSpecies) return result;
  const rootDex: number = maybeRoot;

  result.set(rootDex, {
    rootDex,
    evolvesFromDexNumber: null,
    trigger: null,
    triggerLabel: null,
  });

  function visit(node: ChainLink, parentDex: number) {
    for (const child of node.evolves_to) {
      const childDex = speciesIdFromUrl(child.species.url);
      if (childDex == null || childDex > totalSpecies) continue;
      const detail = child.evolution_details[0];
      const formatted = detail ? formatTrigger(detail) : null;
      result.set(childDex, {
        rootDex,
        evolvesFromDexNumber: parentDex,
        trigger: formatted?.trigger ?? null,
        triggerLabel: formatted?.label ?? null,
      });
      visit(child, childDex);
    }
  }

  visit(chain.chain, rootDex);
  return result;
}

async function fetchOne(
  id: number,
  totalSpecies: number,
  typeChart: Map<TypeName, DamageRelations>,
): Promise<PokemonRow> {
  const [speciesRes, pokemonRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
  ]);
  if (!speciesRes.ok) throw new Error(`species ${id} ${speciesRes.status}`);
  if (!pokemonRes.ok) throw new Error(`pokemon ${id} ${pokemonRes.status}`);
  const species = (await speciesRes.json()) as SpeciesResponse;
  const pokemon = (await pokemonRes.json()) as PokemonResponse;

  const chainId = chainIdFromUrl(species.evolution_chain.url);
  const chainEntry = chainId != null
    ? walkChain(await fetchChain(chainId), totalSpecies).get(species.id) ?? null
    : null;

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
  const effortByName = new Map(
    pokemon.stats.map((s) => [s.stat.name, s.effort]),
  );

  const defenderTypes = pokemon.types
    .map((t) => t.type.name.toLowerCase())
    .filter((n): n is TypeName => (TYPE_NAMES as readonly string[]).includes(n));
  const matchups = computeMatchups(defenderTypes, typeChart);

  return {
    nationalDexNumber: species.id,
    name: titleCase(species.name),
    generation: gen.generation,
    region: gen.region,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.id}.png`,
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.id}.png`,
    shinyArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${species.id}.png`,
    animatedSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${species.id}.gif`,
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
    evHp: effortByName.get("hp") ?? 0,
    evAttack: effortByName.get("attack") ?? 0,
    evDefense: effortByName.get("defense") ?? 0,
    evSpecialAttack: effortByName.get("special-attack") ?? 0,
    evSpecialDefense: effortByName.get("special-defense") ?? 0,
    evSpeed: effortByName.get("speed") ?? 0,
    weaknesses4x: matchups.weaknesses4x,
    weaknesses2x: matchups.weaknesses2x,
    resistances1_2: matchups.resistances1_2,
    resistances1_4: matchups.resistances1_4,
    immunities: matchups.immunities,
    captureRate: species.capture_rate,
    baseHappiness: species.base_happiness,
    growthRate: species.growth_rate?.name ?? null,
    eggGroups: species.egg_groups.map((g) => g.name),
    genderRate: species.gender_rate,
    hatchCounter: species.hatch_counter,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    isBaby: species.is_baby,
    habitat: species.habitat?.name ?? null,
    shape: species.shape?.name ?? null,
    dexColor: species.color?.name ?? null,
    flavorTexts,
    evolutionChainRootDex: chainEntry?.rootDex ?? null,
    evolvesFromDexNumber: chainEntry?.evolvesFromDexNumber ?? null,
    evolutionTrigger: chainEntry?.trigger ?? null,
    evolutionTriggerLabel: chainEntry?.triggerLabel ?? null,
  };
}

async function main(): Promise<void> {
  console.log("Loading type chart…");
  const typeChart = await loadTypeChart();
  console.log(`Loaded damage relations for ${typeChart.size} types`);

  const out: PokemonRow[] = [];
  for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
    const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const rows = await Promise.all(ids.map((id) => fetchOne(id, TOTAL, typeChart)));
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
