'use server'

import { prisma } from '@/lib/db'

export interface CreateGameLineupInput {
  gameId: number
  teamId: string
  lineup: any
  roster: any
}

export interface UpdateGameLineupInput {
  lineup?: any
  roster?: any
}

// Create a unique lineup instance for a specific game
export async function createGameLineup(data: CreateGameLineupInput) {
  try {
    const lineup = await prisma.gameLineup.create({
      data: {
        gameId: data.gameId,
        teamId: data.teamId,
        lineup: data.lineup,
        roster: data.roster,
      },
      include: {
        game: true,
      },
    })
    return { success: true, lineup }
  } catch (error) {
    console.error('Failed to create game lineup:', error)
    return { success: false, error: 'Failed to create game lineup' }
  }
}

// Get lineup for a specific game
export async function getGameLineup(gameId: number) {
  try {
    const lineup = await prisma.gameLineup.findUnique({
      where: { gameId },
      include: {
        game: {
          include: {
            team: true,
          },
        },
      },
    })
    return { success: true, lineup }
  } catch (error) {
    console.error('Failed to get game lineup:', error)
    return { success: false, error: 'Failed to get game lineup' }
  }
}

// Update lineup for a specific game
export async function updateGameLineup(gameId: number, data: UpdateGameLineupInput) {
  try {
    const lineup = await prisma.gameLineup.update({
      where: { gameId },
      data,
      include: {
        game: true,
      },
    })
    return { success: true, lineup }
  } catch (error) {
    console.error('Failed to update game lineup:', error)
    return { success: false, error: 'Failed to update game lineup' }
  }
}

// Delete lineup for a specific game
export async function deleteGameLineup(gameId: number) {
  try {
    await prisma.gameLineup.delete({
      where: { gameId },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete game lineup:', error)
    return { success: false, error: 'Failed to delete game lineup' }
  }
}

// Create or update lineup (upsert)
export async function upsertGameLineup(data: CreateGameLineupInput) {
  try {
    const lineup = await prisma.gameLineup.upsert({
      where: { gameId: data.gameId },
      create: {
        gameId: data.gameId,
        teamId: data.teamId,
        lineup: data.lineup,
        roster: data.roster,
      },
      update: {
        lineup: data.lineup,
        roster: data.roster,
      },
      include: {
        game: true,
      },
    })
    return { success: true, lineup }
  } catch (error) {
    console.error('Failed to upsert game lineup:', error)
    return { success: false, error: 'Failed to upsert game lineup' }
  }
}
