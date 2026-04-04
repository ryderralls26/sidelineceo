import { NextRequest, NextResponse } from 'next/server'
import { getFinalizedGames } from '@/lib/actions/games'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const result = await getFinalizedGames(teamId)
  if (result.success) {
    return NextResponse.json({ games: result.games })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
