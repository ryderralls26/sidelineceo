'use server'

import { prisma } from '@/lib/db'
import { GameStatus } from '@prisma/client'
import { calculateQuartersPlayedFromLineup } from '@/lib/utils/quartersPlayedUtils'
import { createBulkNotifications } from '@/lib/actions/notifications'

// Helper function to check if user has access to a team
async function checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
  const membership = await prisma.teamMembership.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  })
  return !!membership
}

export interface CreateGameInput {
  teamId: string
  date: string
  time?: string
  opponent: string
  location: string
  field?: string
  notes?: string
}

export interface UpdateGameInput {
  date?: string
  time?: string
  opponent?: string
  location?: string
  field?: string
  status?: GameStatus
  result?: string
  notes?: string
  finalizedAt?: Date
}

export async function createGame(data: CreateGameInput) {
  try {
    const game = await prisma.game.create({
      data: {
        teamId: data.teamId,
        date: data.date,
        time: data.time,
        opponent: data.opponent,
        location: data.location,
        field: data.field,
        notes: data.notes,
      },
      include: {
        team: true,
      },
    })
    return { success: true, game }
  } catch (error) {
    console.error('Failed to create game:', error)
    return { success: false, error: 'Failed to create game' }
  }
}

export async function getGame(id: number) {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        team: true,
        awards: {
          include: {
            player: true,
            awardedByUser: true,
          },
        },
        lineup: true,
      },
    })
    return { success: true, game }
  } catch (error) {
    console.error('Failed to get game:', error)
    return { success: false, error: 'Failed to get game' }
  }
}

export async function getGamesByTeam(teamId: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    const games = await prisma.game.findMany({
      where: { teamId },
      include: {
        awards: {
          include: {
            player: true,
          },
        },
        lineup: true,
      },
      orderBy: { date: 'asc' },
    })
    return { success: true, games }
  } catch (error) {
    console.error('Failed to get games:', error)
    return { success: false, error: 'Failed to get games' }
  }
}

export async function updateGame(id: number, data: UpdateGameInput) {
  try {
    const game = await prisma.game.update({
      where: { id },
      data,
      include: {
        team: true,
        awards: true,
        lineup: true,
      },
    })
    return { success: true, game }
  } catch (error) {
    console.error('Failed to update game:', error)
    return { success: false, error: 'Failed to update game' }
  }
}

export async function deleteGame(id: number) {
  try {
    await prisma.game.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete game:', error)
    return { success: false, error: 'Failed to delete game' }
  }
}

export interface FinalizeGameInput {
  gameId: number
  cardData: any // Snapshot of the game card data
  finalScore?: string
  awards?: Array<{
    playerId: number
    awardName: string
    notes?: string
    awardedBy: string
  }>
}

export async function finalizeGame(input: FinalizeGameInput) {
  try {
    const { gameId, cardData, finalScore, awards = [] } = input

    // First, get the game with its lineup to calculate quarters played
    const gameWithLineup = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        lineup: true,
        team: true,
      },
    })

    if (!gameWithLineup) {
      return { success: false, error: 'Game not found' }
    }

    // Calculate quarters played from lineup if it exists
    const quartersPlayedData: Array<{
      playerId: number
      teamId: string
      gameId: number
      quartersPlayed: number
    }> = []

    if (gameWithLineup.lineup && gameWithLineup.lineup.lineup) {
      const quarterCounts = calculateQuartersPlayedFromLineup(gameWithLineup.lineup.lineup)

      // Convert to array format for batch creation
      quarterCounts.forEach((quartersPlayed, playerId) => {
        quartersPlayedData.push({
          playerId,
          teamId: gameWithLineup.teamId,
          gameId,
          quartersPlayed,
        })
      })
    }

    // Use a transaction to update game status, write quarters played, and create awards atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update game with finalization data
      const game = await tx.game.update({
        where: { id: gameId },
        data: {
          status: 'finalized',
          isFinalized: true,
          finalizedAt: new Date(),
          cardData: cardData as any,
          finalScore: finalScore,
        },
        include: {
          team: true,
          awards: {
            include: {
              player: true,
              awardedByUser: true,
            },
          },
          lineup: true,
        },
      })

      // Write quarters played records if we have any
      if (quartersPlayedData.length > 0) {
        await Promise.all(
          quartersPlayedData.map(data =>
            tx.quartersPlayed.upsert({
              where: {
                playerId_gameId: {
                  playerId: data.playerId,
                  gameId: data.gameId,
                },
              },
              update: {
                quartersPlayed: data.quartersPlayed,
              },
              create: data,
            })
          )
        )
      }

      // Create award records
      if (awards.length > 0) {
        await Promise.all(
          awards.map(award =>
            tx.award.create({
              data: {
                gameId: gameId,
                playerId: award.playerId,
                teamId: gameWithLineup.teamId,
                awardName: award.awardName,
                notes: award.notes || '',
                awardedBy: award.awardedBy,
                awardedAt: new Date(),
              },
            })
          )
        )
      }

      return game
    })

    // Create notifications for all other coaches on the team
    const teamMemberships = await prisma.teamMembership.findMany({
      where: {
        teamId: gameWithLineup.teamId,
        role: { in: ['OWNER', 'ADMIN', 'CO_COACH'] },
      },
      include: {
        user: true,
      },
    })

    // Get the coach who finalized (from awards if available)
    const finalizingCoachId = awards.length > 0 ? awards[0].awardedBy : null

    // Create notifications for other coaches (excluding the one who finalized)
    const notificationInputs = teamMemberships
      .filter(membership => membership.userId !== finalizingCoachId)
      .map(membership => ({
        userId: membership.userId,
        teamId: gameWithLineup.teamId,
        type: 'CARD_FINALIZED' as const,
        message: `Game card finalized for ${gameWithLineup.opponent} on ${gameWithLineup.date}`,
      }))

    if (notificationInputs.length > 0) {
      await createBulkNotifications(notificationInputs)
    }

    return { success: true, game: result }
  } catch (error) {
    console.error('Failed to finalize game:', error)
    return { success: false, error: 'Failed to finalize game' }
  }
}

export async function unlockGame(gameId: number) {
  try {
    // Use a transaction to unlock game and delete associated awards and quarters played
    const result = await prisma.$transaction(async (tx) => {
      // Delete awards for this game
      await tx.award.deleteMany({
        where: { gameId },
      })

      // Delete quarters played records for this game
      await tx.quartersPlayed.deleteMany({
        where: { gameId },
      })

      // Update game to unlock it
      const game = await tx.game.update({
        where: { id: gameId },
        data: {
          isFinalized: false,
          status: 'completed',
        },
        include: {
          team: true,
          lineup: true,
        },
      })

      return game
    })

    return { success: true, game: result }
  } catch (error) {
    console.error('Failed to unlock game:', error)
    return { success: false, error: 'Failed to unlock game' }
  }
}

export async function getFinalizedGames(teamId: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    const games = await prisma.game.findMany({
      where: {
        teamId,
        isFinalized: true,
      },
      include: {
        awards: {
          include: {
            player: true,
            awardedByUser: true,
          },
        },
        lineup: true,
      },
      orderBy: { finalizedAt: 'desc' },
    })
    return { success: true, games }
  } catch (error) {
    console.error('Failed to get finalized games:', error)
    return { success: false, error: 'Failed to get finalized games' }
  }
}

export async function updateFinalScore(gameId: number, finalScore: string) {
  try {
    const game = await prisma.game.update({
      where: { id: gameId },
      data: { finalScore },
    })
    return { success: true, game }
  } catch (error) {
    console.error('Failed to update final score:', error)
    return { success: false, error: 'Failed to update final score' }
  }
}
