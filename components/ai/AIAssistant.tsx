'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  Bug, 
  Code, 
  BookOpen, 
  X,
  Loader2 
} from 'lucide-react'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string>('explain')
  
  const { code, language } = useEditorStore()

  const actions = [
    { id: 'explain', label: 'Explain', icon: BookOpen, color: 'text-blue-500' },
    { id: 'improve', label: 'Improve', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 'debug', label: 'Debug', icon: Bug, color: 'text-red-500' },
    { id: 'complete', label: 'Complete', icon: Code, color: 'text-green-500' },
  ]

  const handleSubmit = async () => {
    if (!prompt.trim() && selectedAction !== 'explain') return
    
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          prompt: prompt || 'Explain this code',
          action: selectedAction,
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResponse(data.response)
      } else {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setResponse('Failed to get AI response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  selectedAction === action.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-accent border-border'
                }`}
              >
                <Icon className={`w-4 h-4 ${selectedAction === action.id ? '' : action.color}`} />
                <span className="text-sm">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : response ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm">{response}</div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            Select an action and ask a question about your code
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder={
              selectedAction === 'explain' 
                ? 'Press Enter to explain the code...' 
                : 'Ask a question or describe what you need...'
            }
            className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || (!prompt.trim() && selectedAction !== 'explain')}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}