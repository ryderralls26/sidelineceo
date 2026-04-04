import { NextRequest, NextResponse } from 'next/server'
import { getGame, updateGame, deleteGame } from '@/lib/actions/games'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await getGame(parseInt(id))

  if (result.success) {
    return NextResponse.json({ data: result.game })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const result = await updateGame(parseInt(id), data)

    if (result.success) {
      return NextResponse.json({ data: result.game })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteGame(parseInt(id))

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
