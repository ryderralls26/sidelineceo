'use server'

import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isAdmin?: boolean
  teamId?: string
}

export interface UpdateUserInput {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: UserRole
  isAdmin?: boolean
  teamId?: string
}

export async function createUser(data: CreateUserInput) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // In production, hash this first
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isAdmin: data.isAdmin ?? false,
        teamId: data.teamId,
      },
    })
    return { success: true, user }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teams: true,
        team: true,
      },
    })
    return { success: true, user }
  } catch (error) {
    console.error('Failed to get user:', error)
    return { success: false, error: 'Failed to get user' }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teams: true,
        team: true,
      },
    })
    return { success: true, user }
  } catch (error) {
    console.error('Failed to get user:', error)
    return { success: false, error: 'Failed to get user' }
  }
}

export async function updateUser(id: string, data: UpdateUserInput) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    })
    return { success: true, user }
  } catch (error) {
    console.error('Failed to update user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        teams: true,
      },
    })
    return { success: true, users }
  } catch (error) {
    console.error('Failed to get users:', error)
    return { success: false, error: 'Failed to get users' }
  }
}
