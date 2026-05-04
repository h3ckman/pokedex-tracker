import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PrismaClient,
  type GameSystem,
  type PokemonType,
  type Region,
} from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Role = "ADMIN" | "SITE_MANAGER" | "TECHNICIAN" | "VIEWER";

type SeedUser = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

type FlavorText = { version: string; text: string };

type SeedPokemon = {
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string | null;
  artworkUrl: string | null;
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

type GameSeed = { gameTitle: string; gameSystem: GameSystem; regionName: string };

const users: SeedUser[] = [
  {
    email: "admin@example.com",
    name: "Admin User",
    password: "password",
    role: "ADMIN",
  },
];

const VERSION_TO_GAME: Record<string, GameSeed> = {
  red: { gameTitle: "Red", gameSystem: "GAME_BOY", regionName: "Kanto" },
  blue: { gameTitle: "Blue", gameSystem: "GAME_BOY", regionName: "Kanto" },
  yellow: { gameTitle: "Yellow", gameSystem: "GAME_BOY", regionName: "Kanto" },
  gold: { gameTitle: "Gold", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
  silver: { gameTitle: "Silver", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
  crystal: { gameTitle: "Crystal", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
  ruby: { gameTitle: "Ruby", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
  sapphire: { gameTitle: "Sapphire", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
  emerald: { gameTitle: "Emerald", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
  firered: { gameTitle: "FireRed", gameSystem: "GAME_BOY_ADVANCE", regionName: "Kanto" },
  leafgreen: { gameTitle: "LeafGreen", gameSystem: "GAME_BOY_ADVANCE", regionName: "Kanto" },
  diamond: { gameTitle: "Diamond", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
  pearl: { gameTitle: "Pearl", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
  platinum: { gameTitle: "Platinum", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
  heartgold: { gameTitle: "HeartGold", gameSystem: "NINTENDO_DS", regionName: "Johto" },
  soulsilver: { gameTitle: "SoulSilver", gameSystem: "NINTENDO_DS", regionName: "Johto" },
  black: { gameTitle: "Black", gameSystem: "NINTENDO_DS", regionName: "Unova" },
  white: { gameTitle: "White", gameSystem: "NINTENDO_DS", regionName: "Unova" },
  "black-2": { gameTitle: "Black 2", gameSystem: "NINTENDO_DS", regionName: "Unova" },
  "white-2": { gameTitle: "White 2", gameSystem: "NINTENDO_DS", regionName: "Unova" },
  x: { gameTitle: "X", gameSystem: "NINTENDO_3DS", regionName: "Kalos" },
  y: { gameTitle: "Y", gameSystem: "NINTENDO_3DS", regionName: "Kalos" },
  "omega-ruby": { gameTitle: "Omega Ruby", gameSystem: "NINTENDO_3DS", regionName: "Hoenn" },
  "alpha-sapphire": { gameTitle: "Alpha Sapphire", gameSystem: "NINTENDO_3DS", regionName: "Hoenn" },
  sun: { gameTitle: "Sun", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
  moon: { gameTitle: "Moon", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
  "ultra-sun": { gameTitle: "Ultra Sun", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
  "ultra-moon": { gameTitle: "Ultra Moon", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
  "lets-go-pikachu": { gameTitle: "Let's Go, Pikachu!", gameSystem: "NINTENDO_SWITCH", regionName: "Kanto" },
  "lets-go-eevee": { gameTitle: "Let's Go, Eevee!", gameSystem: "NINTENDO_SWITCH", regionName: "Kanto" },
  sword: { gameTitle: "Sword", gameSystem: "NINTENDO_SWITCH", regionName: "Galar" },
  shield: { gameTitle: "Shield", gameSystem: "NINTENDO_SWITCH", regionName: "Galar" },
  "brilliant-diamond": { gameTitle: "Brilliant Diamond", gameSystem: "NINTENDO_SWITCH", regionName: "Sinnoh" },
  "shining-pearl": { gameTitle: "Shining Pearl", gameSystem: "NINTENDO_SWITCH", regionName: "Sinnoh" },
  "legends-arceus": { gameTitle: "Legends: Arceus", gameSystem: "NINTENDO_SWITCH", regionName: "Hisui" },
  scarlet: { gameTitle: "Scarlet", gameSystem: "NINTENDO_SWITCH", regionName: "Paldea" },
  violet: { gameTitle: "Violet", gameSystem: "NINTENDO_SWITCH", regionName: "Paldea" },
};

const VALID_TYPES = new Set<PokemonType>([
  "NORMAL", "FIRE", "WATER", "GRASS", "ELECTRIC", "ICE", "FIGHTING",
  "POISON", "GROUND", "FLYING", "PSYCHIC", "BUG", "ROCK", "GHOST",
  "DRAGON", "DARK", "STEEL", "FAIRY",
]);

function toPokemonTypes(input: string[]): PokemonType[] {
  return input
    .map((t) => t.toUpperCase())
    .filter((t): t is PokemonType => VALID_TYPES.has(t as PokemonType));
}

async function upsertUser(user: SeedUser): Promise<void> {
  const passwordHash = await hashPassword(user.password);
  const now = new Date();
  await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name, role: user.role, emailVerified: now },
    create: {
      email: user.email,
      name: user.name,
      passwordHash,
      role: user.role,
      emailVerified: now,
    },
  });
  console.log(`Seeded user: ${user.email} / ${user.password}`);
}

async function seedPokemon(): Promise<{ pokemonCount: number; entryCount: number }> {
  const path = join(process.cwd(), "prisma/data/pokemon.json");
  const rows: SeedPokemon[] = JSON.parse(readFileSync(path, "utf8"));
  if (rows.length === 0) {
    console.log("pokemon.json is empty — skipping Pokémon seeding");
    return { pokemonCount: 0, entryCount: 0 };
  }

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((row) => {
        const data = {
          name: row.name,
          generation: row.generation,
          region: row.region,
          spriteUrl: row.spriteUrl,
          artworkUrl: row.artworkUrl,
          types: toPokemonTypes(row.types),
          height: row.height,
          weight: row.weight,
          abilities: row.abilities,
          genus: row.genus,
          hp: row.hp,
          attack: row.attack,
          defense: row.defense,
          specialAttack: row.specialAttack,
          specialDefense: row.specialDefense,
          speed: row.speed,
        };
        return prisma.pokemon.upsert({
          where: { nationalDexNumber: row.nationalDexNumber },
          update: data,
          create: { nationalDexNumber: row.nationalDexNumber, ...data },
        });
      }),
    );
    console.log(`Upserted Pokémon ${i + 1}-${Math.min(i + BATCH, rows.length)}`);
  }

  let entryCount = 0;
  let skippedVersions = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const pokemons = await prisma.pokemon.findMany({
      where: {
        nationalDexNumber: { in: batch.map((r) => r.nationalDexNumber) },
      },
      select: { id: true, nationalDexNumber: true },
    });
    const idByDex = new Map(pokemons.map((p) => [p.nationalDexNumber, p.id]));

    const ops = batch.flatMap((row) => {
      const pokemonId = idByDex.get(row.nationalDexNumber);
      if (!pokemonId) return [];
      return row.flavorTexts.flatMap((ft) => {
        const game = VERSION_TO_GAME[ft.version];
        if (!game) {
          skippedVersions++;
          return [];
        }
        return [
          prisma.pokedexEntry.upsert({
            where: {
              pokemonId_gameTitle: { pokemonId, gameTitle: game.gameTitle },
            },
            update: {
              gameSystem: game.gameSystem,
              regionName: game.regionName,
              flavorText: ft.text,
            },
            create: {
              pokemonId,
              gameTitle: game.gameTitle,
              gameSystem: game.gameSystem,
              regionName: game.regionName,
              flavorText: ft.text,
            },
          }),
        ];
      });
    });

    if (ops.length > 0) {
      await prisma.$transaction(ops);
      entryCount += ops.length;
    }
    console.log(`Upserted entries for Pokémon ${i + 1}-${Math.min(i + BATCH, rows.length)}`);
  }

  if (skippedVersions > 0) {
    console.log(`Skipped ${skippedVersions} flavor entries with unknown version slugs`);
  }
  return { pokemonCount: rows.length, entryCount };
}

async function main() {
  for (const user of users) {
    await upsertUser(user);
  }
  const userCount = await prisma.user.count();
  console.log(`Seeded ${userCount} users`);

  const { pokemonCount, entryCount } = await seedPokemon();
  console.log(`Seeded ${pokemonCount} Pokémon, ${entryCount} entries`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
