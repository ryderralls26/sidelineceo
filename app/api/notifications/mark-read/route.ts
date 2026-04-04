import { NextRequest, NextResponse } from 'next/server'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/actions/notifications'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      const result = await markAllNotificationsAsRead(session.userId)
      if (result.success) {
        return NextResponse.json({ success: true, count: result.count })
      }
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })
    }

    const result = await markNotificationAsRead(notificationId)

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Mark read API error:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
