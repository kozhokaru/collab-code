'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { CollaboratorPresence } from '@/components/editor/CollaboratorPresence'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { usePersistence } from '@/hooks/usePersistence'
import { useReconnection } from '@/hooks/useReconnection'
import { useSessionStore } from '@/store/sessionStore'
import { useEditorStore } from '@/store/editorStore'
import { Save, WifiOff, Wifi, Settings, Share2, Download, Sparkles } from 'lucide-react'
import { AIAssistant } from '@/components/ai/AIAssistant'

// Dynamically import CodeEditor to avoid SSR issues with Monaco
const CodeEditor = dynamic(
  () => import('@/components/editor/CodeEditor').then(mod => mod.CodeEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }
)

export default function EditorPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [userId, setUserId] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  
  const { session, currentUser, isConnected, setSession, setCurrentUser } = useSessionStore()
  const { code, language } = useEditorStore()
  
  // Always call hooks, but pass empty userId when not joined
  const { channel } = useRealtimeSync({ sessionId, userId: userId || 'pending' })
  const { saveCode, isSaved } = usePersistence({ sessionId, userId: userId || 'pending' })
  const { isReconnecting, retryCount } = useReconnection({
    onReconnect: () => console.log('Reconnected!'),
    onDisconnect: () => console.log('Disconnected!'),
  })

  // Load session data (only once on mount)
  useEffect(() => {
    if (!session) {  // Only load if not already loaded
      const loadSession = async () => {
        try {
          const response = await fetch(`/api/sessions?id=${sessionId}`)
          if (response.ok) {
            const sessionData = await response.json()
            setSession(sessionData)
            useEditorStore.getState().setCode(sessionData.code)
            useEditorStore.getState().setLanguage(sessionData.language)
          }
        } catch (error) {
          console.error('Failed to load session:', error)
        }
      }
      
      loadSession()
    }
  }, [sessionId]) // Remove setSession from deps

  const joinSession = async () => {
    if (!username.trim()) return

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          username: username.trim(),
        }),
      })

      if (response.ok) {
        const user = await response.json()
        setUserId(user.id)
        setCurrentUser(user)
        setShowJoinDialog(false)
      }
    } catch (error) {
      console.error('Failed to join session:', error)
    }
  }

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session?.name || 'code'}.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Session URL copied to clipboard!')
  }

  if (showJoinDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-lg border p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Join Session</h2>
          <p className="text-muted-foreground mb-4">
            Enter your name to join the collaborative editing session
          </p>
          <input
            type="text"
            placeholder="Your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background mb-4"
            onKeyDown={(e) => e.key === 'Enter' && joinSession()}
            autoFocus
          />
          <button
            onClick={joinSession}
            disabled={!username.trim()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Session
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{session?.name || 'Loading...'}</h1>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">Connected</span>
                </div>
              ) : isReconnecting ? (
                <div className="flex items-center gap-1 text-yellow-600">
                  <WifiOff className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">Reconnecting... ({retryCount}/5)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
              {!isSaved && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Save className="w-4 h-4" />
                  <span className="text-xs">Saving...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CollaboratorPresence />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`p-2 hover:bg-accent rounded-md transition-colors ${showAIAssistant ? 'bg-accent' : ''}`}
                title="AI Assistant"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Share session"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Export code"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => saveCode(true)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Save snapshot"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor 
          sessionId={sessionId} 
          language={language}
          theme="vs-dark"
        />
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
    </div>
  )
}