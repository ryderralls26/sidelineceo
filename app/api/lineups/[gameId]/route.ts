import { NextRequest, NextResponse } from 'next/server'
import { getGameLineup, updateGameLineup, deleteGameLineup } from '@/lib/actions/lineups'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const result = await getGameLineup(parseInt(gameId))

  if (result.success) {
    return NextResponse.json({ data: result.lineup })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const data = await request.json()
    const result = await updateGameLineup(parseInt(gameId), data)

    if (result.success) {
      return NextResponse.json({ data: result.lineup })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const result = await deleteGameLineup(parseInt(gameId))

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
