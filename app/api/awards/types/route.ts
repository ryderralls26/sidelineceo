import { NextRequest, NextResponse } from 'next/server'
import { getAwardTypes, createAwardType } from '@/lib/actions/awards'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const result = await getAwardTypes(teamId)
  if (result.success) {
    return NextResponse.json({ data: result.awardTypes })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const { teamId, name, description } = await request.json()

    if (!teamId || !name) {
      return NextResponse.json({ error: 'teamId and name are required' }, { status: 400 })
    }

    const result = await createAwardType(teamId, name, description)

    if (result.success) {
      return NextResponse.json({ data: result.awardType }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
