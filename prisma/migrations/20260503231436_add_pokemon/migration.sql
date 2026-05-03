-- CreateEnum
CREATE TYPE "Region" AS ENUM ('KANTO', 'JOHTO', 'HOENN', 'SINNOH', 'UNOVA', 'KALOS', 'ALOLA', 'GALAR', 'PALDEA');

-- CreateEnum
CREATE TYPE "GameSystem" AS ENUM ('GAME_BOY', 'GAME_BOY_COLOR', 'GAME_BOY_ADVANCE', 'NINTENDO_DS', 'NINTENDO_3DS', 'NINTENDO_SWITCH');

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL,
    "nationalDexNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "region" "Region" NOT NULL,
    "spriteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokedexEntry" (
    "id" TEXT NOT NULL,
    "pokemonId" TEXT NOT NULL,
    "gameTitle" TEXT NOT NULL,
    "gameSystem" "GameSystem" NOT NULL,
    "regionName" TEXT NOT NULL,
    "entryNumber" INTEGER,
    "flavorText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokedexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_nationalDexNumber_key" ON "Pokemon"("nationalDexNumber");

-- CreateIndex
CREATE INDEX "Pokemon_name_idx" ON "Pokemon"("name");

-- CreateIndex
CREATE INDEX "Pokemon_generation_idx" ON "Pokemon"("generation");

-- CreateIndex
CREATE INDEX "Pokemon_region_idx" ON "Pokemon"("region");

-- CreateIndex
CREATE INDEX "PokedexEntry_pokemonId_idx" ON "PokedexEntry"("pokemonId");

-- CreateIndex
CREATE INDEX "PokedexEntry_gameSystem_idx" ON "PokedexEntry"("gameSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PokedexEntry_pokemonId_gameTitle_key" ON "PokedexEntry"("pokemonId", "gameTitle");

-- AddForeignKey
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
