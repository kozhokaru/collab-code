'use client'

import { useEffect } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

export function CollaboratorStyles() {
  const { cursors } = usePresenceStore()

  useEffect(() => {
    // Create or update style element for collaborator colors
    let styleElement = document.getElementById('collaborator-styles') as HTMLStyleElement
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'collaborator-styles'
      document.head.appendChild(styleElement)
    }

    // Generate CSS for each collaborator
    const styles = Array.from(cursors.values())
      .filter(cursor => cursor && cursor.userId && cursor.color)
      .map(cursor => {
        const userId = cursor.userId.replace(/[^a-zA-Z0-9]/g, '-')
        return `
          /* Cursor caret line */
          .collaborator-cursor-caret-${userId}::before {
            content: '';
            position: absolute;
            width: 2px;
            height: 20px;
            background: ${cursor.color} !important;
            animation: cursor-blink 1s ease-in-out infinite;
            z-index: 100;
          }
          
          /* Username label */
          .collaborator-label-${userId}::after {
            position: absolute;
            top: -20px;
            left: 0;
            padding: 2px 6px;
            background: ${cursor.color} !important;
            color: white;
            font-size: 11px;
            font-weight: 500;
            border-radius: 3px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          /* Selection highlight */
          .collaborator-selection-${userId} {
            background: ${cursor.color}33 !important;
          }
        `
      }).join('\n')

    styleElement.textContent = styles

    return () => {
      // Cleanup if needed
    }
  }, [cursors])

  return null
}