import { NextRequest, NextResponse } from 'next/server'
import { createTeam, getTeamsByCoach, getAllTeams } from '@/lib/actions/teams'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const coachId = searchParams.get('coachId')

  if (coachId) {
    const result = await getTeamsByCoach(coachId)
    if (result.success) {
      return NextResponse.json({ data: result.teams })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  const result = await getAllTeams()
  if (result.success) {
    return NextResponse.json({ data: result.teams })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createTeam(data)

    if (result.success) {
      return NextResponse.json({ data: result.team }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
