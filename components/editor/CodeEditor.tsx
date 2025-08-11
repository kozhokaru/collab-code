'use client'

import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEditorStore } from '@/store/editorStore'

interface CodeEditorProps {
  sessionId: string
  language?: string
  theme?: 'vs-dark' | 'light'
  readOnly?: boolean
}

export function CodeEditor({ 
  sessionId, 
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { code, setCode, cursorPosition, setCursorPosition } = useEditorStore()

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position
      setCursorPosition({
        lineNumber: position.lineNumber,
        column: position.column,
        offset: editor.getModel()?.getOffsetAt(position) || 0
      })
    })

    // Focus editor on mount
    editor.focus()
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  useEffect(() => {
    // Set up Monaco Editor configuration
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: {
          enabled: true
        },
        guides: {
          bracketPairs: true,
          indentation: true
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        }
      })
    }
  }, [])

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  )
}