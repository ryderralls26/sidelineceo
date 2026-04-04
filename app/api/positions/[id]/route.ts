import { NextRequest, NextResponse } from 'next/server'
import { updatePosition, deletePosition } from '@/lib/actions/positions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const result = await updatePosition(parseInt(id), data)

    if (result.success) {
      return NextResponse.json({ data: result.position })
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
  const result = await deletePosition(parseInt(id))

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
