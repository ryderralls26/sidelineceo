import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getAllUsers } from '@/lib/actions/users'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (email) {
    const result = await getUserByEmail(email)
    if (result.success) {
      return NextResponse.json({ data: result.user })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  const result = await getAllUsers()
  if (result.success) {
    return NextResponse.json({ data: result.users })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createUser(data)

    if (result.success) {
      return NextResponse.json({ data: result.user }, { status: 201 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
