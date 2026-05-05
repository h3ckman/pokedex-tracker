-- CreateTable
CREATE TABLE "UserPokemon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pokemonId" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "caught" BOOLEAN NOT NULL DEFAULT false,
    "seenAt" TIMESTAMP(3),
    "caughtAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPokemon_userId_idx" ON "UserPokemon"("userId");

-- CreateIndex
CREATE INDEX "UserPokemon_userId_caught_idx" ON "UserPokemon"("userId", "caught");

-- CreateIndex
CREATE UNIQUE INDEX "UserPokemon_userId_pokemonId_key" ON "UserPokemon"("userId", "pokemonId");

-- AddForeignKey
ALTER TABLE "UserPokemon" ADD CONSTRAINT "UserPokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPokemon" ADD CONSTRAINT "UserPokemon_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
