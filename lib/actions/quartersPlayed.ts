'use server'

import { prisma } from '@/lib/db'

export interface QuartersPlayedInput {
  playerId: number
  teamId: string
  gameId: number
  quartersPlayed: number
}

/**
 * Write quarters played data for multiple players in a single transaction
 * This should be called during game finalization
 */
export async function writeQuartersPlayed(data: QuartersPlayedInput[]) {
  try {
    // Use a transaction to ensure all records are written atomically
    const result = await prisma.$transaction(
      data.map(entry =>
        prisma.quartersPlayed.create({
          data: {
            playerId: entry.playerId,
            teamId: entry.teamId,
            gameId: entry.gameId,
            quartersPlayed: entry.quartersPlayed,
          },
        })
      )
    )
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to write quarters played data:', error)
    return { success: false, error: 'Failed to write quarters played data' }
  }
}

/**
 * Get quarters played summary for a team
 * Returns player stats including total quarters, games played, and average
 */
export async function getQuartersPlayedByTeam(teamId: string) {
  try {
    const quartersPlayedData = await prisma.quartersPlayed.findMany({
      where: { teamId },
      include: {
        player: true,
        game: true,
      },
      orderBy: [
        { player: { firstName: 'asc' } },
        { player: { lastName: 'asc' } },
      ],
    })

    // Aggregate data by player
    const playerMap = new Map<number, {
      playerId: number
      playerName: string
      totalQuarters: number
      gamesPlayed: number
      avgQuartersPerGame: number
    }>()

    quartersPlayedData.forEach(entry => {
      const existing = playerMap.get(entry.playerId)
      if (existing) {
        existing.totalQuarters += entry.quartersPlayed
        existing.gamesPlayed += 1
        existing.avgQuartersPerGame = existing.totalQuarters / existing.gamesPlayed
      } else {
        playerMap.set(entry.playerId, {
          playerId: entry.playerId,
          playerName: `${entry.player.firstName} ${entry.player.lastName}`,
          totalQuarters: entry.quartersPlayed,
          gamesPlayed: 1,
          avgQuartersPerGame: entry.quartersPlayed,
        })
      }
    })

    // Convert to array and calculate team average
    const players = Array.from(playerMap.values())
    const teamAverage = players.length > 0
      ? players.reduce((sum, p) => sum + p.totalQuarters, 0) / players.length
      : 0

    return {
      success: true,
      data: {
        players,
        teamAverage,
      },
    }
  } catch (error) {
    console.error('Failed to get quarters played data:', error)
    return { success: false, error: 'Failed to get quarters played data' }
  }
}

/**
 * Get quarters played for a specific game
 */
export async function getQuartersPlayedByGame(gameId: number) {
  try {
    const quartersPlayedData = await prisma.quartersPlayed.findMany({
      where: { gameId },
      include: {
        player: true,
      },
      orderBy: [
        { player: { firstName: 'asc' } },
        { player: { lastName: 'asc' } },
      ],
    })

    return { success: true, data: quartersPlayedData }
  } catch (error) {
    console.error('Failed to get quarters played for game:', error)
    return { success: false, error: 'Failed to get quarters played for game' }
  }
}

