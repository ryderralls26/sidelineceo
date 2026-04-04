'use server'

import { prisma } from '@/lib/db'

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

export interface CreatePlayerInput {
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
}

export interface UpdatePlayerInput {
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
}

export async function createPlayer(data: CreatePlayerInput) {
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
      include: {
        team: true,
        parents: true,
      },
    })
    return { success: true, player }
  } catch (error) {
    console.error('Failed to create player:', error)
    return { success: false, error: 'Failed to create player' }
  }
}

export async function getPlayer(id: number) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        parents: true,
        awards: true,
      },
    })
    return { success: true, player }
  } catch (error) {
    console.error('Failed to get player:', error)
    return { success: false, error: 'Failed to get player' }
  }
}

export async function getPlayersByTeam(teamId: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    const players = await prisma.player.findMany({
      where: { teamId },
      include: {
        parents: true,
        awards: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return { success: true, players }
  } catch (error) {
    console.error('Failed to get players:', error)
    return { success: false, error: 'Failed to get players' }
  }
}

export async function updatePlayer(id: number, data: UpdatePlayerInput) {
  try {
    const player = await prisma.player.update({
      where: { id },
      data,
      include: {
        team: true,
        parents: true,
      },
    })
    return { success: true, player }
  } catch (error) {
    console.error('Failed to update player:', error)
    return { success: false, error: 'Failed to update player' }
  }
}

export async function deletePlayer(id: number) {
  try {
    await prisma.player.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete player:', error)
    return { success: false, error: 'Failed to delete player' }
  }
}

export async function bulkUpdatePlayers(updates: Array<{ id: number; data: UpdatePlayerInput }>) {
  try {
    const results = await Promise.all(
      updates.map(({ id, data }) =>
        prisma.player.update({
          where: { id },
          data,
        })
      )
    )
    return { success: true, players: results }
  } catch (error) {
    console.error('Failed to bulk update players:', error)
    return { success: false, error: 'Failed to bulk update players' }
  }
}
