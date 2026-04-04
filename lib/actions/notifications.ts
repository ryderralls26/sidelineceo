'use server'

import { prisma } from '@/lib/db'
import { NotificationType } from '@prisma/client'

export interface CreateNotificationInput {
  userId: string
  teamId?: string
  type: NotificationType
  message: string
}

/**
 * Create a notification for a user
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        teamId: input.teamId,
        type: input.type,
        message: input.message,
      },
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(inputs: CreateNotificationInput[]) {
  try {
    const notifications = await prisma.notification.createMany({
      data: inputs.map(input => ({
        userId: input.userId,
        teamId: input.teamId,
        type: input.type,
        message: input.message,
      })),
    })

    return { success: true, count: notifications.count }
  } catch (error) {
    console.error('Failed to create bulk notifications:', error)
    return { success: false, error: 'Failed to create notifications' }
  }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string, limit = 10) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return { success: false, error: 'Failed to get notifications' }
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return { success: true, count }
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return { success: false, error: 'Failed to get unread count' }
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true, count: result.count }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}

/**
 * Get pending team invite notifications for a user
 */
export async function getPendingInviteNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        type: 'INVITE_PENDING',
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Failed to get pending invite notifications:', error)
    return { success: false, error: 'Failed to get pending invites' }
  }
}
