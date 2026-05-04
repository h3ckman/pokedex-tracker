-- CreateEnum
CREATE TYPE "PokemonType" AS ENUM ('NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY');

-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN     "abilities" TEXT[],
ADD COLUMN     "artworkUrl" TEXT,
ADD COLUMN     "genus" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "types" "PokemonType"[],
ADD COLUMN     "weight" INTEGER;
