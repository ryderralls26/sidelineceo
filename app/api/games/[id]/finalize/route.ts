import { NextRequest, NextResponse } from 'next/server'
import { finalizeGame, FinalizeGameInput } from '@/lib/actions/games'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const input: FinalizeGameInput = {
      gameId: parseInt(id),
      cardData: body.cardData,
      finalScore: body.finalScore,
      awards: body.awards || [],
    }

    const result = await finalizeGame(input)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.game })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Finalize game API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to finalize game' }, { status: 500 })
  }
}
