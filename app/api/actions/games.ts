'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGamesByTeam(teamId: string) {
  try {
    const games = await prisma.game.findMany({
      where: { teamId },
      orderBy: { date: 'asc' },
      include: {
        lineup: true,
        awards: {
          include: {
            player: true,
          },
        },
      },
    })
    return { success: true, data: games }
  } catch (error) {
    console.error('Error fetching games:', error)
    return { success: false, error: 'Failed to fetch games' }
  }
}

export async function getGame(id: number) {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        lineup: true,
        awards: {
          include: {
            player: true,
          },
        },
      },
    })
    return { success: true, data: game }
  } catch (error) {
    console.error('Error fetching game:', error)
    return { success: false, error: 'Failed to fetch game' }
  }
}

export async function createGame(data: {
  teamId: string
  date: string
  time?: string
  opponent: string
  location: string
  field?: string
  status?: 'scheduled' | 'completed' | 'finalized'
  result?: string
  notes?: string
}) {
  try {
    const game = await prisma.game.create({
      data: {
        teamId: data.teamId,
        date: data.date,
        time: data.time,
        opponent: data.opponent,
        location: data.location,
        field: data.field,
        status: data.status ?? 'scheduled',
        result: data.result,
        notes: data.notes,
      },
    })
    revalidatePath('/schedule')
    return { success: true, data: game }
  } catch (error) {
    console.error('Error creating game:', error)
    return { success: false, error: 'Failed to create game' }
  }
}

export async function updateGame(id: number, data: {
  date?: string
  time?: string
  opponent?: string
  location?: string
  field?: string
  status?: 'scheduled' | 'completed' | 'finalized'
  result?: string
  notes?: string
  finalizedAt?: Date
}) {
  try {
    const game = await prisma.game.update({
      where: { id },
      data,
    })
    revalidatePath('/schedule')
    return { success: true, data: game }
  } catch (error) {
    console.error('Error updating game:', error)
    return { success: false, error: 'Failed to update game' }
  }
}

export async function deleteGame(id: number) {
  try {
    await prisma.game.delete({
      where: { id },
    })
    revalidatePath('/schedule')
    return { success: true }
  } catch (error) {
    console.error('Error deleting game:', error)
    return { success: false, error: 'Failed to delete game' }
  }
}

export async function finalizeGame(gameId: number) {
  try {
    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'finalized',
        finalizedAt: new Date(),
      },
    })
    revalidatePath('/schedule')
    return { success: true, data: game }
  } catch (error) {
    console.error('Error finalizing game:', error)
    return { success: false, error: 'Failed to finalize game' }
  }
}
