-- CreateEnum
CREATE TYPE "AbilityName" AS ENUM ('STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA');

-- CreateEnum
CREATE TYPE "SkillName" AS ENUM ('ACROBATICS', 'ANIMAL_HANDLING', 'ARCANA', 'ATHLETICS', 'DECEPTION', 'HISTORY', 'INSIGHT', 'INTIMIDATION', 'INVESTIGATION', 'MEDICINE', 'NATURE', 'PERCEPTION', 'PERFORMANCE', 'PERSUASION', 'RELIGION', 'SLEIGHT_OF_HAND', 'STEALTH', 'SURVIVAL');

-- CreateEnum
CREATE TYPE "SpellSchool" AS ENUM ('ABJURATION', 'CONJURATION', 'DIVINATION', 'ENCHANTMENT', 'EVOCATION', 'ILLUSION', 'NECROMANCY', 'TRANSMUTATION');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'SHIELD', 'TOOL', 'CONSUMABLE', 'TREASURE', 'MISC');

-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'ARTIFACT');

-- CreateEnum
CREATE TYPE "NoteCategory" AS ENUM ('CAMPAIGN', 'SESSION', 'NPC', 'LORE', 'QUEST', 'OTHER');

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "subrace" TEXT,
    "characterClass" TEXT NOT NULL,
    "subclass" TEXT,
    "background" TEXT NOT NULL,
    "alignment" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "maxHp" INTEGER NOT NULL DEFAULT 10,
    "currentHp" INTEGER NOT NULL DEFAULT 10,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "hitDiceTotal" INTEGER NOT NULL DEFAULT 1,
    "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
    "hitDieType" INTEGER NOT NULL DEFAULT 8,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "electrum" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "spellcastingAbility" "AbilityName",
    "slot1Max" INTEGER NOT NULL DEFAULT 0,
    "slot1Used" INTEGER NOT NULL DEFAULT 0,
    "slot2Max" INTEGER NOT NULL DEFAULT 0,
    "slot2Used" INTEGER NOT NULL DEFAULT 0,
    "slot3Max" INTEGER NOT NULL DEFAULT 0,
    "slot3Used" INTEGER NOT NULL DEFAULT 0,
    "slot4Max" INTEGER NOT NULL DEFAULT 0,
    "slot4Used" INTEGER NOT NULL DEFAULT 0,
    "slot5Max" INTEGER NOT NULL DEFAULT 0,
    "slot5Used" INTEGER NOT NULL DEFAULT 0,
    "slot6Max" INTEGER NOT NULL DEFAULT 0,
    "slot6Used" INTEGER NOT NULL DEFAULT 0,
    "slot7Max" INTEGER NOT NULL DEFAULT 0,
    "slot7Used" INTEGER NOT NULL DEFAULT 0,
    "slot8Max" INTEGER NOT NULL DEFAULT 0,
    "slot8Used" INTEGER NOT NULL DEFAULT 0,
    "slot9Max" INTEGER NOT NULL DEFAULT 0,
    "slot9Used" INTEGER NOT NULL DEFAULT 0,
    "personality" TEXT,
    "ideals" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "backstory" TEXT,
    "appearance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbilityScore" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "ability" "AbilityName" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "AbilityScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingThrow" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "ability" "AbilityName" NOT NULL,
    "proficient" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SavingThrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProficiency" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skill" "SkillName" NOT NULL,
    "proficient" BOOLEAN NOT NULL DEFAULT false,
    "expertise" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "type" "ItemType" NOT NULL DEFAULT 'MISC',
    "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" "SpellSchool" NOT NULL,
    "castingTime" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "alwaysPrepared" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "NoteCategory" NOT NULL DEFAULT 'CAMPAIGN',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AbilityScore_characterId_ability_key" ON "AbilityScore"("characterId", "ability");

-- CreateIndex
CREATE UNIQUE INDEX "SavingThrow_characterId_ability_key" ON "SavingThrow"("characterId", "ability");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProficiency_characterId_skill_key" ON "SkillProficiency"("characterId", "skill");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");

-- CreateIndex
CREATE INDEX "Spell_characterId_level_idx" ON "Spell"("characterId", "level");

-- CreateIndex
CREATE INDEX "Feature_characterId_idx" ON "Feature"("characterId");

-- CreateIndex
CREATE INDEX "Condition_characterId_idx" ON "Condition"("characterId");

-- CreateIndex
CREATE INDEX "Note_characterId_idx" ON "Note"("characterId");

-- CreateIndex
CREATE INDEX "Note_characterId_pinned_idx" ON "Note"("characterId", "pinned");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityScore" ADD CONSTRAINT "AbilityScore_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingThrow" ADD CONSTRAINT "SavingThrow_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProficiency" ADD CONSTRAINT "SkillProficiency_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
