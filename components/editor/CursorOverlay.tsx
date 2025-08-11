'use client'

import { useEffect, useRef } from 'react'
import { usePresenceStore } from '@/store/presenceStore'
import type { editor } from 'monaco-editor'

interface CursorOverlayProps {
  editorInstance: editor.IStandaloneCodeEditor | null
}

export function CursorOverlay({ editorInstance }: CursorOverlayProps) {
  const { cursors } = usePresenceStore()
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    if (!editorInstance) return

    // Clear previous decorations
    decorationsRef.current = editorInstance.deltaDecorations(
      decorationsRef.current,
      []
    )

    const newDecorations: editor.IModelDeltaDecoration[] = []

    // Add decorations for each collaborator cursor
    cursors.forEach((cursor) => {
      const userId = cursor.userId.replace(/[^a-zA-Z0-9]/g, '-')
      
      // Cursor decoration
      newDecorations.push({
        range: {
          startLineNumber: cursor.position.lineNumber,
          startColumn: cursor.position.column,
          endLineNumber: cursor.position.lineNumber,
          endColumn: cursor.position.column,
        },
        options: {
          className: `collaborator-cursor collaborator-cursor-${userId}`,
          beforeContentClassName: `collaborator-cursor-caret collaborator-cursor-${userId}`,
          hoverMessage: { value: cursor.username },
          stickiness: editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          zIndex: 100,
        },
      })

      // Selection decoration if exists
      if (cursor.selection) {
        newDecorations.push({
          range: {
            startLineNumber: cursor.selection.startLineNumber,
            startColumn: cursor.selection.startColumn,
            endLineNumber: cursor.selection.endLineNumber,
            endColumn: cursor.selection.endColumn,
          },
          options: {
            className: `collaborator-selection collaborator-selection-${userId}`,
            inlineClassName: `collaborator-selection-inline collaborator-selection-${userId}`,
            stickiness: editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        })
      }

      // Username label with inline style for color
      newDecorations.push({
        range: {
          startLineNumber: cursor.position.lineNumber,
          startColumn: cursor.position.column,
          endLineNumber: cursor.position.lineNumber,
          endColumn: cursor.position.column,
        },
        options: {
          afterContentClassName: `collaborator-label collaborator-label-${userId}`,
          stickiness: editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      })
    })

    // Apply new decorations
    decorationsRef.current = editorInstance.deltaDecorations(
      decorationsRef.current,
      newDecorations
    )

    return () => {
      // Cleanup decorations
      if (editorInstance) {
        decorationsRef.current = editorInstance.deltaDecorations(
          decorationsRef.current,
          []
        )
      }
    }
  }, [cursors, editorInstance])

  return null
}