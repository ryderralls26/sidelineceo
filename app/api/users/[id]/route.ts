import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/actions/users'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await getUserById(id)

  if (result.success) {
    return NextResponse.json({ data: result.user })
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
    const result = await updateUser(id, data)

    if (result.success) {
      return NextResponse.json({ data: result.user })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
