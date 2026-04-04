import { NextRequest, NextResponse } from 'next/server'
import { getNotifications } from '@/lib/actions/notifications'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await getNotifications(session.userId, limit)

    if (result.success) {
      return NextResponse.json({ notifications: result.notifications })
    }

    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 })
  }
}
