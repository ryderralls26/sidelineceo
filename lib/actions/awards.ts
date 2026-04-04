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

export interface CreateAwardInput {
  gameId: number
  playerId: number
  teamId: string
  awardName: string
  notes?: string
  awardedBy: string
}

export async function createAward(data: CreateAwardInput) {
  try {
    const award = await prisma.award.create({
      data: {
        gameId: data.gameId,
        playerId: data.playerId,
        teamId: data.teamId,
        awardName: data.awardName,
        notes: data.notes || '',
        awardedBy: data.awardedBy,
      },
      include: {
        game: true,
        player: true,
        team: true,
        awardedByUser: true,
      },
    })
    return { success: true, award }
  } catch (error) {
    console.error('Failed to create award:', error)
    return { success: false, error: 'Failed to create award' }
  }
}

export async function getAwardsByGame(gameId: number) {
  try {
    const awards = await prisma.award.findMany({
      where: { gameId },
      include: {
        player: true,
        awardedByUser: true,
      },
      orderBy: { awardedAt: 'desc' },
    })
    return { success: true, awards }
  } catch (error) {
    console.error('Failed to get awards:', error)
    return { success: false, error: 'Failed to get awards' }
  }
}

export async function getAwardsByPlayer(playerId: number) {
  try {
    const awards = await prisma.award.findMany({
      where: { playerId },
      include: {
        game: true,
        awardedByUser: true,
      },
      orderBy: { awardedAt: 'desc' },
    })
    return { success: true, awards }
  } catch (error) {
    console.error('Failed to get awards:', error)
    return { success: false, error: 'Failed to get awards' }
  }
}

export async function getAwardsByTeam(teamId: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    // Get all awards for games belonging to this team
    const awards = await prisma.award.findMany({
      where: {
        game: {
          teamId,
        },
      },
      include: {
        player: true,
        game: true,
        awardedByUser: true,
      },
      orderBy: { awardedAt: 'desc' },
    })
    return { success: true, awards }
  } catch (error) {
    console.error('Failed to get awards by team:', error)
    return { success: false, error: 'Failed to get awards by team' }
  }
}

export async function deleteAward(id: string) {
  try {
    await prisma.award.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete award:', error)
    return { success: false, error: 'Failed to delete award' }
  }
}

// Award Types - Team-specific
export async function getAwardTypes(teamId: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    const awardTypes = await prisma.awardType.findMany({
      where: { teamId },
      orderBy: { name: 'asc' },
    })

    // If no award types exist for this team, create defaults
    if (awardTypes.length === 0) {
      const defaults = [
        { name: 'MVP', description: 'Most Valuable Player', teamId },
        { name: 'Defensive Player of the Game', description: 'Defensive Player of the Game', teamId },
        { name: 'Offensive Player of the Game', description: 'Offensive Player of the Game', teamId },
      ]

      const created = await Promise.all(
        defaults.map(type => prisma.awardType.create({ data: type }))
      )

      return { success: true, awardTypes: created }
    }

    return { success: true, awardTypes }
  } catch (error) {
    console.error('Failed to get award types:', error)
    return { success: false, error: 'Failed to get award types' }
  }
}

export async function createAwardType(teamId: string, name: string, description?: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const hasAccess = await checkTeamAccess(userId, teamId)
      if (!hasAccess) {
        return { success: false, error: 'Access denied to this team' }
      }
    }

    const awardType = await prisma.awardType.create({
      data: { name, description, teamId },
    })
    return { success: true, awardType }
  } catch (error) {
    console.error('Failed to create award type:', error)
    return { success: false, error: 'Failed to create award type' }
  }
}

export async function deleteAwardType(id: string, userId?: string) {
  try {
    // If userId is provided, check team access
    if (userId) {
      const awardType = await prisma.awardType.findUnique({ where: { id } })
      if (awardType) {
        const hasAccess = await checkTeamAccess(userId, awardType.teamId)
        if (!hasAccess) {
          return { success: false, error: 'Access denied to this team' }
        }
      }
    }

    await prisma.awardType.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete award type:', error)
    return { success: false, error: 'Failed to delete award type' }
  }
}

// Get consecutive awards for motivation detection
export async function getConsecutiveAwards(playerId: number, awardName: string, teamId: string) {
  try {
    // Get all awards for this player with this award name, ordered by creation date descending
    const awards = await prisma.award.findMany({
      where: {
        playerId,
        awardName,
        teamId,
      },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Check for consecutive awards
    let consecutiveCount = 0
    for (let i = 0; i < awards.length; i++) {
      if (i === 0) {
        consecutiveCount = 1
        continue
      }

      // Check if the games are consecutive (simplified - checks if they're in recent sequence)
      const currentGame = awards[i]
      const previousGame = awards[i - 1]

      // If there's a gap in the game sequence, break
      const gameDiff = Math.abs(previousGame.gameId - currentGame.gameId)
      if (gameDiff === 1) {
        consecutiveCount++
      } else {
        break
      }
    }

    return { success: true, consecutiveCount, awards }
  } catch (error) {
    console.error('Failed to get consecutive awards:', error)
    return { success: false, error: 'Failed to get consecutive awards', consecutiveCount: 0 }
  }
}
