import { NextRequest, NextResponse } from 'next/server'
import { getQuartersPlayedByTeam } from '@/lib/actions/quartersPlayed'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      )
    }

    const result = await getQuartersPlayedByTeam(teamId)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error in quarters-played API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
