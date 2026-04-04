import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdatePlayers } from '@/lib/actions/players'

export async function PUT(request: NextRequest) {
  try {
    const { updates } = await request.json()
    const result = await bulkUpdatePlayers(updates)

    if (result.success) {
      return NextResponse.json({ data: result.players })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
