import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: snapshots, error } = await supabase
    .from('code_snapshots')
    .select('*, users(username)')
    .eq('session_id', sessionId)
    .order('version', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(snapshots)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, userId, content } = body

  if (!sessionId || !userId || content === undefined) {
    return NextResponse.json(
      { error: 'Session ID, user ID, and content are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Get the latest version number
  const { data: latestSnapshot } = await supabase
    .from('code_snapshots')
    .select('version')
    .eq('session_id', sessionId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = latestSnapshot ? latestSnapshot.version + 1 : 1

  const { data: snapshot, error } = await supabase
    .from('code_snapshots')
    .insert({
      session_id: sessionId,
      user_id: userId,
      content,
      version: nextVersion,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Also update the session's code
  await supabase
    .from('sessions')
    .update({ code: content })
    .eq('id', sessionId)

  return NextResponse.json(snapshot, { status: 201 })
}