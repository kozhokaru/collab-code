'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { editor } from 'monaco-editor'

// Dynamically import the CodeEditor to avoid SSR issues
const CodeEditor = dynamic(
  () => import('./CodeEditor').then(mod => mod.CodeEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }
)

// Dynamically import CursorOverlay
const CursorOverlay = dynamic(
  () => import('./CursorOverlay').then(mod => mod.CursorOverlay),
  { ssr: false }
)

interface CodeEditorWrapperProps {
  sessionId: string
  language?: string
  theme?: 'vs-dark' | 'light'
  readOnly?: boolean
}

export function CodeEditorWrapper(props: CodeEditorWrapperProps) {
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null)

  return (
    <>
      <CodeEditor {...props} />
      {editorInstance && <CursorOverlay editorInstance={editorInstance} />}
    </>
  )
}