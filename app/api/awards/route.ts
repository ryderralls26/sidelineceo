import { NextRequest, NextResponse } from 'next/server'
import { createAward, getAwardsByGame, getAwardsByPlayer } from '@/lib/actions/awards'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameId = searchParams.get('gameId')
  const playerId = searchParams.get('playerId')

  if (gameId) {
    const result = await getAwardsByGame(parseInt(gameId))
    if (result.success) {
      return NextResponse.json({ data: result.awards })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  if (playerId) {
    const result = await getAwardsByPlayer(parseInt(playerId))
    if (result.success) {
      return NextResponse.json({ data: result.awards })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(
    { error: 'gameId or playerId is required' },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createAward(data)

    if (result.success) {
      return NextResponse.json({ data: result.award }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
