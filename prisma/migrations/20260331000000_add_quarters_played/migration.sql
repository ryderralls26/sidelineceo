-- CreateTable
CREATE TABLE "QuartersPlayed" (
    "id" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "quartersPlayed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuartersPlayed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuartersPlayed_playerId_idx" ON "QuartersPlayed"("playerId");

-- CreateIndex
CREATE INDEX "QuartersPlayed_teamId_idx" ON "QuartersPlayed"("teamId");

-- CreateIndex
CREATE INDEX "QuartersPlayed_gameId_idx" ON "QuartersPlayed"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "QuartersPlayed_playerId_gameId_key" ON "QuartersPlayed"("playerId", "gameId");

-- AddForeignKey
ALTER TABLE "QuartersPlayed" ADD CONSTRAINT "QuartersPlayed_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuartersPlayed" ADD CONSTRAINT "QuartersPlayed_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuartersPlayed" ADD CONSTRAINT "QuartersPlayed_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
