'use client'

import { useEffect } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { usePresenceStore } from '@/store/presenceStore'
import { Users } from 'lucide-react'

export function CollaboratorPresence() {
  const { collaborators, currentUser } = useSessionStore()
  const { cursors } = usePresenceStore()

  const activeCollaborators = collaborators.filter(c => c.is_active && c.id !== currentUser?.id)

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{activeCollaborators.length + 1} active</span>
      </div>
      
      <div className="flex items-center gap-2">
        {currentUser && (
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: `${currentUser.color}20`, color: currentUser.color }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentUser.color }}
            />
            <span>{currentUser.username} (You)</span>
          </div>
        )}
        
        {activeCollaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: `${collaborator.color}20`, color: collaborator.color }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: collaborator.color }}
            />
            <span>{collaborator.username}</span>
          </div>
        ))}
      </div>
    </div>
  )
}