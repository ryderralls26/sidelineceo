'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTeamsByCoach(coachId: string) {
  try {
    const teams = await prisma.team.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: teams }
  } catch (error) {
    console.error('Error fetching teams:', error)
    return { success: false, error: 'Failed to fetch teams' }
  }
}

export async function getTeam(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: true,
        games: true,
      },
    })
    return { success: true, data: team }
  } catch (error) {
    console.error('Error fetching team:', error)
    return { success: false, error: 'Failed to fetch team' }
  }
}

export async function createTeam(data: {
  name: string
  sport: 'flag_football' | 'soccer'
  division?: 'KIND' | 'FR' | 'SO' | 'JR' | 'SR'
  season: 'fall' | 'spring' | 'summer'
  year: string
  logoUrl?: string
  coachId: string
}) {
  try {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        sport: data.sport,
        division: data.division,
        season: data.season,
        year: data.year,
        logoUrl: data.logoUrl,
        coachId: data.coachId,
      },
    })
    revalidatePath('/coach-dashboard')
    return { success: true, data: team }
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

export async function updateTeam(id: string, data: {
  name?: string
  sport?: 'flag_football' | 'soccer'
  division?: 'KIND' | 'FR' | 'SO' | 'JR' | 'SR' | null
  season?: 'fall' | 'spring' | 'summer'
  year?: string
  logoUrl?: string
}) {
  try {
    const team = await prisma.team.update({
      where: { id },
      data,
    })
    revalidatePath('/coach-dashboard')
    return { success: true, data: team }
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({
      where: { id },
    })
    revalidatePath('/coach-dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}

export async function duplicateTeam(teamId: string, userId: string) {
  try {
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

      // Create OWNER membership for the creator
      await tx.teamMembership.create({
        data: {
          userId,
          teamId: team.id,
          role: 'OWNER',
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

    revalidatePath('/coach-dashboard')
    return { success: true, team: newTeam }
  } catch (error) {
    console.error('Failed to duplicate team:', error)
    return { success: false, error: 'Failed to duplicate team' }
  }
}
