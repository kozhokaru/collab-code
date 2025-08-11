import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, username } = body

  if (!sessionId || !username) {
    return NextResponse.json(
      { error: 'Session ID and username are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Generate a random color for the user
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#DA77F2', '#4C6EF5', '#15AABF',
    '#FF8787', '#69DB7C', '#FFD43B', '#A78BFA'
  ]
  const color = colors[Math.floor(Math.random() * colors.length)]

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      session_id: sessionId,
      username,
      color,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(user, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { userId, cursorPosition, selectionStart, selectionEnd, isActive } = body

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const updateData: any = {
    last_seen: new Date().toISOString(),
  }

  if (cursorPosition !== undefined) updateData.cursor_position = cursorPosition
  if (selectionStart !== undefined) updateData.selection_start = selectionStart
  if (selectionEnd !== undefined) updateData.selection_end = selectionEnd
  if (isActive !== undefined) updateData.is_active = isActive

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(user)
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Set user as inactive instead of deleting
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}