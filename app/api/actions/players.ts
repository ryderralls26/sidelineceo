'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPlayersByTeam(teamId: string) {
  try {
    const players = await prisma.player.findMany({
      where: { teamId },
      orderBy: { createdAt: 'asc' },
    })
    return { success: true, data: players }
  } catch (error) {
    console.error('Error fetching players:', error)
    return { success: false, error: 'Failed to fetch players' }
  }
}

export async function getPlayer(id: number) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
    })
    return { success: true, data: player }
  } catch (error) {
    console.error('Error fetching player:', error)
    return { success: false, error: 'Failed to fetch player' }
  }
}

export async function createPlayer(data: {
  teamId: string
  play?: boolean
  fourthQuarterLock?: boolean
  jerseyNumber: string
  firstName: string
  lastName: string
  nickname?: string
  position1: string
  position2?: string
  secondaryPosition?: string
  defensivePosition?: string
}) {
  try {
    const player = await prisma.player.create({
      data: {
        teamId: data.teamId,
        play: data.play ?? false,
        fourthQuarterLock: data.fourthQuarterLock ?? false,
        jerseyNumber: data.jerseyNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        position1: data.position1,
        position2: data.position2,
        secondaryPosition: data.secondaryPosition,
        defensivePosition: data.defensivePosition,
      },
    })
    revalidatePath('/roster')
    return { success: true, data: player }
  } catch (error) {
    console.error('Error creating player:', error)
    return { success: false, error: 'Failed to create player' }
  }
}

export async function updatePlayer(id: number, data: {
  play?: boolean
  fourthQuarterLock?: boolean
  jerseyNumber?: string
  firstName?: string
  lastName?: string
  nickname?: string
  position1?: string
  position2?: string
  secondaryPosition?: string
  defensivePosition?: string
}) {
  try {
    const player = await prisma.player.update({
      where: { id },
      data,
    })
    revalidatePath('/roster')
    return { success: true, data: player }
  } catch (error) {
    console.error('Error updating player:', error)
    return { success: false, error: 'Failed to update player' }
  }
}

export async function deletePlayer(id: number) {
  try {
    await prisma.player.delete({
      where: { id },
    })
    revalidatePath('/roster')
    return { success: true }
  } catch (error) {
    console.error('Error deleting player:', error)
    return { success: false, error: 'Failed to delete player' }
  }
}

export async function bulkUpdatePlayers(players: Array<{
  id: number
  play?: boolean
  fourthQuarterLock?: boolean
  jerseyNumber?: string
  firstName?: string
  lastName?: string
  nickname?: string
  position1?: string
  position2?: string
  secondaryPosition?: string
  defensivePosition?: string
}>) {
  try {
    await prisma.$transaction(
      players.map(player =>
        prisma.player.update({
          where: { id: player.id },
          data: {
            play: player.play,
            fourthQuarterLock: player.fourthQuarterLock,
            jerseyNumber: player.jerseyNumber,
            firstName: player.firstName,
            lastName: player.lastName,
            nickname: player.nickname,
            position1: player.position1,
            position2: player.position2,
            secondaryPosition: player.secondaryPosition,
            defensivePosition: player.defensivePosition,
          },
        })
      )
    )
    revalidatePath('/roster')
    return { success: true }
  } catch (error) {
    console.error('Error bulk updating players:', error)
    return { success: false, error: 'Failed to update players' }
  }
}
