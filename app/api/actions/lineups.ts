'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGameLineup(gameId: number) {
  try {
    const lineup = await prisma.gameLineup.findUnique({
      where: { gameId },
      include: {
        players: true,
      },
    })
    return { success: true, data: lineup }
  } catch (error) {
    console.error('Error fetching game lineup:', error)
    return { success: false, error: 'Failed to fetch game lineup' }
  }
}

export async function createOrUpdateGameLineup(data: {
  gameId: number
  teamId: string
  lineup: any
  roster: any
}) {
  try {
    // Check if lineup already exists
    const existing = await prisma.gameLineup.findUnique({
      where: { gameId: data.gameId },
    })

    let gameLineup
    if (existing) {
      // Update existing lineup
      gameLineup = await prisma.gameLineup.update({
        where: { gameId: data.gameId },
        data: {
          lineup: data.lineup,
          roster: data.roster,
        },
      })
    } else {
      // Create new lineup
      gameLineup = await prisma.gameLineup.create({
        data: {
          gameId: data.gameId,
          teamId: data.teamId,
          lineup: data.lineup,
          roster: data.roster,
        },
      })
    }

    revalidatePath('/schedule')
    revalidatePath('/roster')
    return { success: true, data: gameLineup }
  } catch (error) {
    console.error('Error creating/updating game lineup:', error)
    return { success: false, error: 'Failed to save game lineup' }
  }
}

export async function deleteGameLineup(gameId: number) {
  try {
    await prisma.gameLineup.delete({
      where: { gameId },
    })
    revalidatePath('/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error deleting game lineup:', error)
    return { success: false, error: 'Failed to delete game lineup' }
  }
}
