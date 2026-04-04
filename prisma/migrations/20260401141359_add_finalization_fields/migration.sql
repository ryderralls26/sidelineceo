-- AlterTable
-- Add finalization fields to Game table
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "isFinalized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "finalScore" TEXT;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "cardData" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Game_isFinalized_idx" ON "Game"("isFinalized");
