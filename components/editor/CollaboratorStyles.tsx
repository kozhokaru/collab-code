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
      .filter(cursor => cursor && cursor.userId && cursor.username && cursor.color)
      .map(cursor => {
        const userId = cursor.userId.replace(/[^a-zA-Z0-9]/g, '-')
        const username = cursor.username.replace(/'/g, "\\'") // Escape quotes in username
        return `
          .collaborator-cursor-${userId}::before {
            background: ${cursor.color} !important;
          }
          .collaborator-selection-${userId} {
            background: ${cursor.color}33 !important;
          }
          .collaborator-label-${userId}::after {
            content: '${username}';
            background: ${cursor.color} !important;
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