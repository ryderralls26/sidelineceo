import { NextRequest, NextResponse } from 'next/server'
import { getPositions, createPosition } from '@/lib/actions/positions'
import { Sport } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sport = (searchParams.get('sport') || 'flag_football') as Sport

  const result = await getPositions(sport)
  if (result.success) {
    return NextResponse.json({ data: result.positions })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createPosition(data)

    if (result.success) {
      return NextResponse.json({ data: result.position }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
