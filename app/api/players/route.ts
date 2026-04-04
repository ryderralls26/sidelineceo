import { NextRequest, NextResponse } from 'next/server'
import { createPlayer, getPlayersByTeam } from '@/lib/actions/players'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const result = await getPlayersByTeam(teamId)
  if (result.success) {
    return NextResponse.json({ data: result.players })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createPlayer(data)

    if (result.success) {
      return NextResponse.json({ data: result.player }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
