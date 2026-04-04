import { NextRequest, NextResponse } from 'next/server'
import { updateFinalScore } from '@/lib/actions/games'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { finalScore } = body

    const result = await updateFinalScore(parseInt(id), finalScore)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.game })
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch (error) {
    console.error('Update final score API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update final score' }, { status: 500 })
  }
}
