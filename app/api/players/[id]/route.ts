import { NextRequest, NextResponse } from 'next/server'
import { getPlayer, updatePlayer, deletePlayer } from '@/lib/actions/players'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await getPlayer(parseInt(id))

  if (result.success) {
    return NextResponse.json({ data: result.player })
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
    const result = await updatePlayer(parseInt(id), data)

    if (result.success) {
      return NextResponse.json({ data: result.player })
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
  const result = await deletePlayer(parseInt(id))

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
