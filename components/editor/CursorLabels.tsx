'use client'

import { useEffect, useState, useRef } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

interface CursorLabelPosition {
  userId: string
  username: string
  color: string
  x: number
  y: number
}

interface CursorLabelsProps {
  editorInstance: any
  currentUserId?: string
}

export function CursorLabels({ editorInstance, currentUserId }: CursorLabelsProps) {
  const { cursors } = usePresenceStore()
  const [labelPositions, setLabelPositions] = useState<CursorLabelPosition[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editorInstance) return

    const updateLabelPositions = () => {
      const newPositions: CursorLabelPosition[] = []
      
      cursors.forEach((cursor) => {
        if (!cursor?.userId || !cursor?.username || !cursor?.position) return
        // Skip current user's cursor
        if (cursor.userId === currentUserId) return
        
        try {
          // Get the position in pixels for the cursor
          const position = {
            lineNumber: cursor.position.lineNumber,
            column: cursor.position.column
          }
          
          // Convert line/column to pixel coordinates
          const coords = editorInstance.getScrolledVisiblePosition(position)
          
          if (coords) {
            newPositions.push({
              userId: cursor.userId,
              username: cursor.username,
              color: cursor.color || '#4C6EF5',
              x: coords.left,
              y: coords.top - 25 // Position above the cursor
            })
          }
        } catch (error) {
          console.error('Error calculating cursor position:', error)
        }
      })
      
      setLabelPositions(newPositions)
    }

    // Update positions initially
    updateLabelPositions()

    // Update positions when editor scrolls
    const scrollDisposable = editorInstance.onDidScrollChange(() => {
      updateLabelPositions()
    })

    // Update positions when layout changes
    const layoutDisposable = editorInstance.onDidLayoutChange(() => {
      updateLabelPositions()
    })

    // Set up interval to update positions regularly (reduced frequency to prevent jitter)
    const intervalId = setInterval(updateLabelPositions, 250)

    return () => {
      scrollDisposable?.dispose()
      layoutDisposable?.dispose()
      clearInterval(intervalId)
    }
  }, [cursors, editorInstance, currentUserId])

  if (!editorInstance) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {labelPositions.map((label) => (
        <div
          key={label.userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: `${label.x}px`,
            top: `${label.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div
            className="px-2 py-1 rounded text-white text-xs font-medium shadow-lg whitespace-nowrap"
            style={{
              backgroundColor: label.color,
              fontSize: '11px'
            }}
          >
            {label.username}
          </div>
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              bottom: '-4px',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `4px solid ${label.color}`
            }}
          />
        </div>
      ))}
    </div>
  )
}