import { NextRequest, NextResponse } from 'next/server'
import { createGameLineup } from '@/lib/actions/lineups'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createGameLineup(data)

    if (result.success) {
      return NextResponse.json({ data: result.lineup }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
