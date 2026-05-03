import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, type GameSystem, type Region } from "../lib/generated/prisma/client";
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

type SeedPokemon = {
  nationalDexNumber: number;
  name: string;
  generation: number;
  region: Region;
  spriteUrl: string | null;
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

const GAMES_BY_GENERATION: Record<number, GameSeed[]> = {
  1: [
    { gameTitle: "Red", gameSystem: "GAME_BOY", regionName: "Kanto" },
    { gameTitle: "Blue", gameSystem: "GAME_BOY", regionName: "Kanto" },
    { gameTitle: "Yellow", gameSystem: "GAME_BOY", regionName: "Kanto" },
  ],
  2: [
    { gameTitle: "Gold", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
    { gameTitle: "Silver", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
    { gameTitle: "Crystal", gameSystem: "GAME_BOY_COLOR", regionName: "Johto" },
  ],
  3: [
    { gameTitle: "Ruby", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
    { gameTitle: "Sapphire", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
    { gameTitle: "Emerald", gameSystem: "GAME_BOY_ADVANCE", regionName: "Hoenn" },
  ],
  4: [
    { gameTitle: "Diamond", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
    { gameTitle: "Pearl", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
    { gameTitle: "Platinum", gameSystem: "NINTENDO_DS", regionName: "Sinnoh" },
  ],
  5: [
    { gameTitle: "Black", gameSystem: "NINTENDO_DS", regionName: "Unova" },
    { gameTitle: "White", gameSystem: "NINTENDO_DS", regionName: "Unova" },
    { gameTitle: "Black 2", gameSystem: "NINTENDO_DS", regionName: "Unova" },
    { gameTitle: "White 2", gameSystem: "NINTENDO_DS", regionName: "Unova" },
  ],
  6: [
    { gameTitle: "X", gameSystem: "NINTENDO_3DS", regionName: "Kalos" },
    { gameTitle: "Y", gameSystem: "NINTENDO_3DS", regionName: "Kalos" },
  ],
  7: [
    { gameTitle: "Sun", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
    { gameTitle: "Moon", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
    { gameTitle: "Ultra Sun", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
    { gameTitle: "Ultra Moon", gameSystem: "NINTENDO_3DS", regionName: "Alola" },
  ],
  8: [
    { gameTitle: "Sword", gameSystem: "NINTENDO_SWITCH", regionName: "Galar" },
    { gameTitle: "Shield", gameSystem: "NINTENDO_SWITCH", regionName: "Galar" },
  ],
  9: [
    { gameTitle: "Scarlet", gameSystem: "NINTENDO_SWITCH", regionName: "Paldea" },
    { gameTitle: "Violet", gameSystem: "NINTENDO_SWITCH", regionName: "Paldea" },
  ],
};

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

  let entryCount = 0;
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((row) =>
        prisma.pokemon.upsert({
          where: { nationalDexNumber: row.nationalDexNumber },
          update: {
            name: row.name,
            generation: row.generation,
            region: row.region,
            spriteUrl: row.spriteUrl,
          },
          create: {
            nationalDexNumber: row.nationalDexNumber,
            name: row.name,
            generation: row.generation,
            region: row.region,
            spriteUrl: row.spriteUrl,
          },
        }),
      ),
    );
    console.log(`Upserted Pokémon ${i + 1}-${Math.min(i + BATCH, rows.length)}`);
  }

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const pokemons = await prisma.pokemon.findMany({
      where: {
        nationalDexNumber: { in: batch.map((r) => r.nationalDexNumber) },
      },
      select: { id: true, nationalDexNumber: true, generation: true },
    });
    const ops = pokemons.flatMap((p) => {
      const games = GAMES_BY_GENERATION[p.generation] ?? [];
      return games.map((g) =>
        prisma.pokedexEntry.upsert({
          where: {
            pokemonId_gameTitle: { pokemonId: p.id, gameTitle: g.gameTitle },
          },
          update: { gameSystem: g.gameSystem, regionName: g.regionName },
          create: {
            pokemonId: p.id,
            gameTitle: g.gameTitle,
            gameSystem: g.gameSystem,
            regionName: g.regionName,
          },
        }),
      );
    });
    if (ops.length > 0) {
      await prisma.$transaction(ops);
      entryCount += ops.length;
    }
    console.log(`Upserted entries for Pokémon ${i + 1}-${Math.min(i + BATCH, rows.length)}`);
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
