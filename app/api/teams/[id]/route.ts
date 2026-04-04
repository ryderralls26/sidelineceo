import { NextRequest, NextResponse } from 'next/server'
import { getTeam, updateTeam, deleteTeam } from '@/lib/actions/teams'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await getTeam(id)

  if (result.success) {
    return NextResponse.json({ data: result.team })
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
    const result = await updateTeam(id, data)

    if (result.success) {
      return NextResponse.json({ data: result.team })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteTeam(id)

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
