'use client'

import { useEffect, useRef } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

interface CursorOverlayProps {
  editorInstance: any
}

export function CursorOverlay({ editorInstance }: CursorOverlayProps) {
  const { cursors } = usePresenceStore()
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    if (!editorInstance) return

    try {
      const model = editorInstance.getModel()
      if (!model) return

      // Clear previous decorations safely
      if (decorationsRef.current.length > 0) {
        decorationsRef.current = editorInstance.deltaDecorations(
          decorationsRef.current,
          []
        )
      }

      const newDecorations: any[] = []

      // Process each cursor
      cursors.forEach((cursor) => {
        if (!cursor?.userId || !cursor?.username || !cursor?.position) return
        
        const userId = cursor.userId.replace(/[^a-zA-Z0-9]/g, '-')
        
        // Simple cursor position - just add a marker, no complex validation
        if (cursor.position.lineNumber && cursor.position.column) {
          // Add cursor line decoration
          newDecorations.push({
            range: {
              startLineNumber: cursor.position.lineNumber,
              startColumn: cursor.position.column,
              endLineNumber: cursor.position.lineNumber,
              endColumn: cursor.position.column,
            },
            options: {
              className: `collaborator-cursor-${userId}`,
              beforeContentClassName: `collaborator-cursor-caret-${userId}`,
              stickiness: 1,
            },
          })
          
          // Add username label as a separate decoration
          newDecorations.push({
            range: {
              startLineNumber: cursor.position.lineNumber,
              startColumn: cursor.position.column,
              endLineNumber: cursor.position.lineNumber,
              endColumn: cursor.position.column,
            },
            options: {
              afterContentClassName: `collaborator-label-${userId}`,
              afterContentText: ` ${cursor.username} `,
              stickiness: 1,
            },
          })
        }
      })

      // Apply new decorations
      if (newDecorations.length > 0) {
        decorationsRef.current = editorInstance.deltaDecorations(
          decorationsRef.current,
          newDecorations
        )
      }
    } catch (error) {
      console.error('Error in CursorOverlay:', error)
    }

    return () => {
      try {
        if (editorInstance && decorationsRef.current.length > 0) {
          editorInstance.deltaDecorations(decorationsRef.current, [])
          decorationsRef.current = []
        }
      } catch (error) {
        console.error('Error cleaning up decorations:', error)
      }
    }
  }, [cursors, editorInstance])

  return null
}