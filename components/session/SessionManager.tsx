'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { Session } from '@/lib/supabase/types'
import { Plus, Users, Clock, Code } from 'lucide-react'

export function SessionManager() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  
  const { setSession } = useSessionStore()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async () => {
    if (!sessionName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionName,
          language: selectedLanguage,
        }),
      })

      if (response.ok) {
        const session = await response.json()
        setSession(session)
        router.push(`/editor/${session.id}`)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setCreating(false)
    }
  }

  const joinSession = (session: Session) => {
    setSession(session)
    router.push(`/editor/${session.id}`)
  }

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Collaborative Code Editor</h1>
        <p className="text-muted-foreground">
          Create or join a session to start coding together in real-time
        </p>
      </div>

      {/* Create Session Card */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Session</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Session name..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md bg-background"
            onKeyDown={(e) => e.key === 'Enter' && createSession()}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={createSession}
            disabled={creating || !sessionName.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions available. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => joinSession(session)}
                className="bg-card rounded-lg border p-4 hover:border-primary cursor-pointer transition-colors"
              >
                <h3 className="font-semibold mb-2">{session.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    {session.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}