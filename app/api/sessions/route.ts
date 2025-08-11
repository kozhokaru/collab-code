import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Session } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  
  const supabase = await createClient()

  if (id) {
    // Get specific session
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(session)
  } else {
    // Get all sessions
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(sessions)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, language = 'javascript' } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Session name is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      name,
      language,
      code: getStarterCode(language),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(session, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, code, language } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const updateData: Partial<Session> = {}
  if (code !== undefined) updateData.code = code
  if (language !== undefined) updateData.language = language

  const { data: session, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(session)
}

function getStarterCode(language: string): string {
  const starters: Record<string, string> = {
    javascript: `// Welcome to the collaborative code editor!
// Start typing to see real-time collaboration in action.

function greet(name) {
  return \`Hello, \${name}! Welcome to our collaborative editor.\`;
}

console.log(greet('World'));`,
    typescript: `// Welcome to the collaborative code editor!
// Start typing to see real-time collaboration in action.

interface User {
  name: string;
  role: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! Welcome to our collaborative editor.\`;
}

const user: User = { name: 'World', role: 'Developer' };
console.log(greet(user));`,
    python: `# Welcome to the collaborative code editor!
# Start typing to see real-time collaboration in action.

def greet(name):
    return f"Hello, {name}! Welcome to our collaborative editor."

if __name__ == "__main__":
    print(greet("World"))`,
    java: `// Welcome to the collaborative code editor!
// Start typing to see real-time collaboration in action.

public class Main {
    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "! Welcome to our collaborative editor.";
    }
}`,
  }

  return starters[language] || starters.javascript
}