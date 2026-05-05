-- CreateEnum
CREATE TYPE "EvolutionTrigger" AS ENUM ('LEVEL_UP', 'USE_ITEM', 'TRADE', 'SHED', 'OTHER');

-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN     "evolutionChainRootDex" INTEGER,
ADD COLUMN     "evolutionTrigger" "EvolutionTrigger",
ADD COLUMN     "evolutionTriggerLabel" TEXT,
ADD COLUMN     "evolvesFromDexNumber" INTEGER;

-- CreateIndex
CREATE INDEX "Pokemon_evolutionChainRootDex_idx" ON "Pokemon"("evolutionChainRootDex");
