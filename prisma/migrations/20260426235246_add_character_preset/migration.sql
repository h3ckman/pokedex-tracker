-- CreateTable
CREATE TABLE "CharacterPreset" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "characterClass" TEXT NOT NULL,
    "subclass" TEXT,
    "race" TEXT NOT NULL,
    "subrace" TEXT,
    "background" TEXT NOT NULL,
    "alignment" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "portraitUrl" TEXT,
    "payload" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterPreset_slug_key" ON "CharacterPreset"("slug");

-- CreateIndex
CREATE INDEX "CharacterPreset_characterClass_idx" ON "CharacterPreset"("characterClass");

-- CreateIndex
CREATE INDEX "CharacterPreset_archetype_idx" ON "CharacterPreset"("archetype");
