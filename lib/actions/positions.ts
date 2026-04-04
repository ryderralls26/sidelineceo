'use server'

import { prisma } from '@/lib/db'
import { Sport } from '@prisma/client'

export interface CreatePositionInput {
  name: string
  abbreviation: string
  rank?: number
  sport?: Sport
}

export async function getPositions(sport: Sport = Sport.flag_football) {
  try {
    const positions = await prisma.position.findMany({
      where: { sport },
      orderBy: { rank: 'asc' },
    })

    // If no positions exist, create defaults for flag football
    if (positions.length === 0 && sport === Sport.flag_football) {
      const defaults = [
        { name: 'Quarterback', abbreviation: 'QB', rank: 1, sport: Sport.flag_football },
        { name: 'Center', abbreviation: 'C', rank: 1, sport: Sport.flag_football },
        { name: 'Running Back', abbreviation: 'RB', rank: 1, sport: Sport.flag_football },
        { name: 'Wide Receiver', abbreviation: 'WR', rank: 1, sport: Sport.flag_football },
        { name: 'Tight End', abbreviation: 'TE', rank: 1, sport: Sport.flag_football },
        { name: 'Defensive Line', abbreviation: 'DL', rank: 1, sport: Sport.flag_football },
        { name: 'Linebacker', abbreviation: 'LB', rank: 1, sport: Sport.flag_football },
        { name: 'Cornerback', abbreviation: 'CB', rank: 1, sport: Sport.flag_football },
        { name: 'Safety', abbreviation: 'S', rank: 1, sport: Sport.flag_football },
      ]

      const created = await Promise.all(
        defaults.map(pos => prisma.position.create({ data: pos }))
      )

      return { success: true, positions: created }
    }

    return { success: true, positions }
  } catch (error) {
    console.error('Failed to get positions:', error)
    return { success: false, error: 'Failed to get positions' }
  }
}

export async function createPosition(data: CreatePositionInput) {
  try {
    const position = await prisma.position.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation,
        rank: data.rank ?? 1,
        sport: data.sport ?? Sport.flag_football,
      },
    })
    return { success: true, position }
  } catch (error) {
    console.error('Failed to create position:', error)
    return { success: false, error: 'Failed to create position' }
  }
}

export async function updatePosition(id: number, data: Partial<CreatePositionInput>) {
  try {
    const position = await prisma.position.update({
      where: { id },
      data,
    })
    return { success: true, position }
  } catch (error) {
    console.error('Failed to update position:', error)
    return { success: false, error: 'Failed to update position' }
  }
}

export async function deletePosition(id: number) {
  try {
    await prisma.position.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to delete position:', error)
    return { success: false, error: 'Failed to delete position' }
  }
}
