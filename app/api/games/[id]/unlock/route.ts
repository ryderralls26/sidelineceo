import { NextRequest, NextResponse } from 'next/server'
import { unlockGame } from '@/lib/actions/games'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await unlockGame(parseInt(id))

    if (result.success) {
      return NextResponse.json({ success: true, data: result.game })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Unlock game API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to unlock game' }, { status: 500 })
  }
}
