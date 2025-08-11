'use client'

import { useEffect, useRef } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

interface CursorOverlayProps {
  editorInstance: any // Simplified type to avoid Monaco import issues
}

export function CursorOverlay({ editorInstance }: CursorOverlayProps) {
  const { cursors } = usePresenceStore()
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    if (!editorInstance) return

    try {
      // Check if the editor model is ready
      const model = editorInstance.getModel()
      if (!model) return

      // Clear previous decorations
      decorationsRef.current = editorInstance.deltaDecorations(
        decorationsRef.current,
        []
      )

      const newDecorations: any[] = [] // Simplified type

    // Add decorations for each collaborator cursor
    cursors.forEach((cursor) => {
      // Skip if cursor data is incomplete
      if (!cursor || !cursor.position || !cursor.userId || !cursor.username) {
        return
      }
      
      const userId = cursor.userId.replace(/[^a-zA-Z0-9]/g, '-')
      
      // Validate cursor position with safe defaults
      const lineCount = model.getLineCount()
      const lineNumber = Math.min(Math.max(1, cursor.position.lineNumber || 1), lineCount)
      const lineContent = model.getLineContent(lineNumber)
      const column = Math.min(Math.max(1, cursor.position.column || 1), lineContent.length + 1)
      
      // Cursor decoration
      newDecorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        },
        options: {
          className: `collaborator-cursor collaborator-cursor-${userId}`,
          beforeContentClassName: `collaborator-cursor-caret collaborator-cursor-${userId}`,
          hoverMessage: { value: cursor.username },
          stickiness: 1, // NeverGrowsWhenTypingAtEdges
          zIndex: 100,
        },
      })

      // Selection decoration if exists
      if (cursor.selection && 
          typeof cursor.selection.startLineNumber === 'number' &&
          typeof cursor.selection.startColumn === 'number' &&
          typeof cursor.selection.endLineNumber === 'number' &&
          typeof cursor.selection.endColumn === 'number') {
        
        // Validate selection range
        const startLine = Math.min(Math.max(1, cursor.selection.startLineNumber), lineCount)
        const endLine = Math.min(Math.max(1, cursor.selection.endLineNumber), lineCount)
        const startCol = Math.max(1, cursor.selection.startColumn)
        const endCol = Math.max(1, cursor.selection.endColumn)
        
        newDecorations.push({
          range: {
            startLineNumber: startLine,
            startColumn: startCol,
            endLineNumber: endLine,
            endColumn: endCol,
          },
          options: {
            className: `collaborator-selection collaborator-selection-${userId}`,
            inlineClassName: `collaborator-selection-inline collaborator-selection-${userId}`,
            stickiness: 1, // NeverGrowsWhenTypingAtEdges
          },
        })
      }

      // Username label with inline style for color
      newDecorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        },
        options: {
          afterContentClassName: `collaborator-label collaborator-label-${userId}`,
          stickiness: 1, // NeverGrowsWhenTypingAtEdges
        },
      })
    })

      // Apply new decorations
      decorationsRef.current = editorInstance.deltaDecorations(
        decorationsRef.current,
        newDecorations
      )
    } catch (error) {
      console.error('Error updating cursor decorations:', error)
    }

    return () => {
      // Cleanup decorations
      try {
        if (editorInstance && editorInstance.getModel()) {
          decorationsRef.current = editorInstance.deltaDecorations(
            decorationsRef.current,
            []
          )
        }
      } catch (error) {
        console.error('Error cleaning up decorations:', error)
      }
    }
  }, [cursors, editorInstance])

  return null
}