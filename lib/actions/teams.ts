'use server'

import { prisma } from '@/lib/db'
import { Sport, Division, Season, TeamRole } from '@prisma/client'

export interface CreateTeamInput {
  name: string
  sport: Sport
  division?: Division
  season: Season
  year: string
  logoUrl?: string
  coachId: string
}

export interface UpdateTeamInput {
  name?: string
  sport?: Sport
  division?: Division
  season?: Season
  year?: string
  logoUrl?: string
}

export async function createTeam(data: CreateTeamInput) {
  try {
    const team = await prisma.team.create({
      data,
      include: {
        coach: true,
        players: true,
      },
    })
    return { success: true, team }
  } catch (error) {
    console.error('Failed to create team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

export async function getTeam(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        coach: true,
        players: true,
        games: {
          orderBy: { date: 'asc' },
        },
        seasons: true,
      },
    })
    return { success: true, team }
  } catch (error) {
    console.error('Failed to get team:', error)
    return { success: false, error: 'Failed to get team' }
  }
}

export async function getTeamsByCoach(coachId: string) {
  try {
    const teams = await prisma.team.findMany({
      where: { coachId },
      include: {
        players: true,
        games: {
          orderBy: { date: 'asc' },
        },
        seasons: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, teams }
  } catch (error) {
    console.error('Failed to get teams:', error)
    return { success: false, error: 'Failed to get teams' }
  }
}

export async function updateTeam(id: string, data: UpdateTeamInput) {
  try {
    const team = await prisma.team.update({
      where: { id },
      data,
      include: {
        coach: true,
        players: true,
      },
    })
    return { success: true, team }
  } catch (error) {
    console.error('Failed to update team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}

export async function getAllTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        coach: true,
        players: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, teams }
  } catch (error) {
    console.error('Failed to get teams:', error)
    return { success: false, error: 'Failed to get teams' }
  }
}

// Multi-team support functions

export interface CreateTeamWithMembershipInput {
  name: string
  division: Division
  coachId: string
}

export async function createTeamWithMembership(data: CreateTeamWithMembershipInput) {
  try {
    // Create team with default values and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: data.name,
          sport: Sport.flag_football,
          division: data.division,
          season: Season.fall,
          year: new Date().getFullYear().toString(),
          coachId: data.coachId,
        },
        include: {
          coach: true,
        },
      })

      // Create COACH membership for the creator
      await tx.teamMembership.create({
        data: {
          userId: data.coachId,
          teamId: team.id,
          role: TeamRole.OWNER,
        },
      })

      return team
    })

    return { success: true, team: result }
  } catch (error) {
    console.error('Failed to create team with membership:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

export async function getUserTeams(userId: string) {
  try {
    // Get all teams where user has membership (COACH or VIEWER)
    const memberships = await prisma.teamMembership.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            coach: true,
            _count: {
              select: {
                players: true,
                games: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const teams = memberships.map((membership) => ({
      ...membership.team,
      userRole: membership.role,
    }))

    return { success: true, teams }
  } catch (error) {
    console.error('Failed to get user teams:', error)
    return { success: false, error: 'Failed to get user teams' }
  }
}

export async function checkTeamAccess(userId: string, teamId: string) {
  try {
    const membership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    return {
      success: true,
      hasAccess: !!membership,
      role: membership?.role,
    }
  } catch (error) {
    console.error('Failed to check team access:', error)
    return { success: false, error: 'Failed to check team access' }
  }
}

export async function addTeamMember(teamId: string, userId: string, role: TeamRole) {
  try {
    const membership = await prisma.teamMembership.create({
      data: {
        teamId,
        userId,
        role,
      },
      include: {
        user: true,
        team: true,
      },
    })

    return { success: true, membership }
  } catch (error) {
    console.error('Failed to add team member:', error)
    return { success: false, error: 'Failed to add team member' }
  }
}

export async function removeTeamMember(teamId: string, userId: string) {
  try {
    await prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to remove team member:', error)
    return { success: false, error: 'Failed to remove team member' }
  }
}

// Duplicate team with roster
export async function duplicateTeam(teamId: string, userId: string) {
  try {
    // Check access
    const hasAccess = await checkTeamAccess(userId, teamId)
    if (!hasAccess) {
      return { success: false, error: 'Access denied to this team' }
    }

    // Get the original team with all related data
    const originalTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: true,
        awardTypes: true,
      },
    })

    if (!originalTeam) {
      return { success: false, error: 'Team not found' }
    }

    // Create new team with copied data in a transaction
    const newTeam = await prisma.$transaction(async (tx) => {
      // Create the new team
      const team = await tx.team.create({
        data: {
          name: `${originalTeam.name} (Copy)`,
          sport: originalTeam.sport,
          division: originalTeam.division,
          season: originalTeam.season,
          year: originalTeam.year,
          logoUrl: originalTeam.logoUrl,
          coachId: originalTeam.coachId,
        },
      })

      // Create COACH membership for the creator
      await tx.teamMembership.create({
        data: {
          userId,
          teamId: team.id,
          role: TeamRole.OWNER,
        },
      })

      // Copy players with default values
      if (originalTeam.players.length > 0) {
        await tx.player.createMany({
          data: originalTeam.players.map((player) => ({
            teamId: team.id,
            play: true, // Default to checked
            fourthQuarterLock: false, // Default to unchecked
            jerseyNumber: player.jerseyNumber,
            firstName: player.firstName,
            lastName: player.lastName,
            nickname: player.nickname,
            position1: player.position1,
            position2: player.position2,
            secondaryPosition: player.secondaryPosition,
            defensivePosition: player.defensivePosition,
          })),
        })
      }

      // Copy award types (or create defaults if none exist)
      const awardTypesToCopy = originalTeam.awardTypes.length > 0
        ? originalTeam.awardTypes
        : [
            { name: 'MVP', description: 'Most Valuable Player' },
            { name: 'Defensive Player of the Game', description: 'Defensive Player of the Game' },
            { name: 'Offensive Player of the Game', description: 'Offensive Player of the Game' },
          ]

      await tx.awardType.createMany({
        data: awardTypesToCopy.map((awardType) => ({
          name: awardType.name,
          description: awardType.description || null,
          teamId: team.id,
        })),
      })

      return team
    })

    return { success: true, team: newTeam }
  } catch (error) {
    console.error('Failed to duplicate team:', error)
    return { success: false, error: 'Failed to duplicate team' }
  }
}
