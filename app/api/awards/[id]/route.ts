import { NextRequest, NextResponse } from 'next/server'
import { deleteAward } from '@/lib/actions/awards'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteAward(id)

  if (result.success) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
