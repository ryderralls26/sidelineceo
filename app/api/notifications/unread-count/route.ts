import { NextRequest, NextResponse } from 'next/server'
import { getUnreadCount } from '@/lib/actions/notifications'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getUnreadCount(session.userId)

    if (result.success) {
      return NextResponse.json({ count: result.count })
    }

    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Unread count API error:', error)
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 })
  }
}
