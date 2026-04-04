import { NextRequest, NextResponse } from 'next/server'
import { upsertGameLineup } from '@/lib/actions/lineups'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await upsertGameLineup(data)

    if (result.success) {
      return NextResponse.json({ data: result.lineup })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
