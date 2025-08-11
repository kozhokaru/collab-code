'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEditorStore } from '@/store/editorStore'
import { useSessionStore } from '@/store/sessionStore'
import { usePresenceStore } from '@/store/presenceStore'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSyncProps {
  sessionId: string
  userId: string
}

export function useRealtimeSync({ sessionId, userId }: RealtimeSyncProps) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const cursorBroadcastTimeout = useRef<NodeJS.Timeout>()
  const codeBroadcastTimeout = useRef<NodeJS.Timeout>()
  const supabase = createClient()
  
  const { code, setCode, cursorPosition } = useEditorStore()
  const { 
    setCollaborators, 
    updateCollaborator, 
    removeCollaborator,
    setConnected,
    currentUser 
  } = useSessionStore()
  const { setCursor, removeCursor, clearCursors, setCurrentUserId } = usePresenceStore()

  useEffect(() => {
    // Skip if userId is not ready
    if (!userId || userId === 'pending') {
      return
    }
    
    // Set current user ID in presence store for filtering
    setCurrentUserId(userId)
    console.log('Setting current user ID for filtering:', userId)
    
    // Create channel for this session
    const channel = supabase.channel(`session:${sessionId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channelRef.current = channel

    // Handle presence sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        
        // Update collaborators list
        const collaborators = Object.entries(state).map(([key, value]) => {
          const data = Array.isArray(value) ? value[0] : value
          return {
            id: key,
            ...data,
          }
        })
        
        setCollaborators(collaborators)
        
        // Update cursors
        clearCursors()
        collaborators.forEach((collaborator: any) => {
          // Double-check to prevent setting current user's cursor
          if (collaborator.id !== userId && collaborator.cursor && collaborator.id !== currentUser?.id) {
            setCursor(collaborator.id, {
              userId: collaborator.id,
              username: collaborator.username,
              color: collaborator.color,
              position: collaborator.cursor.position,
              selection: collaborator.cursor.selection,
            })
          }
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key)
        removeCursor(key)
        removeCollaborator(key)
      })

    // Handle broadcast events for code changes
    channel
      .on('broadcast', { event: 'code-change' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setCode(payload.code)
        }
      })
      .on('broadcast', { event: 'cursor-change' }, ({ payload }) => {
        // Double-check to prevent setting current user's cursor
        if (payload.userId !== userId && payload.userId !== currentUser?.id) {
          setCursor(payload.userId, {
            userId: payload.userId,
            username: payload.username,
            color: payload.color,
            position: payload.position,
            selection: payload.selection,
          })
        }
      })

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        console.log('Connected to session:', sessionId)
        
        // Track presence
        channel.track({
          username: currentUser?.username || 'Anonymous',
          color: currentUser?.color || generateUserColor(),
          cursor: {
            position: cursorPosition,
            selection: null,
          },
          online_at: new Date().toISOString(),
        })
      } else if (status === 'CLOSED') {
        setConnected(false)
        console.log('Disconnected from session')
      }
    })

    return () => {
      // Cleanup
      channel.unsubscribe()
      channelRef.current = null
      clearCursors()
      setConnected(false)
      setCurrentUserId(null)
    }
  }, [sessionId, userId, currentUser])

  // Broadcast code changes with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (codeBroadcastTimeout.current) {
      clearTimeout(codeBroadcastTimeout.current)
    }
    
    // Only broadcast after 100ms of no code changes (faster than cursor for better sync)
    codeBroadcastTimeout.current = setTimeout(() => {
      if (channelRef.current && code !== undefined && userId && userId !== 'pending') {
        channelRef.current.send({
          type: 'broadcast',
          event: 'code-change',
          payload: {
            userId,
            code,
            timestamp: new Date().toISOString(),
          },
        })
      }
    }, 100)
    
    return () => {
      if (codeBroadcastTimeout.current) {
        clearTimeout(codeBroadcastTimeout.current)
      }
    }
  }, [code, userId])

  // Broadcast cursor changes with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (cursorBroadcastTimeout.current) {
      clearTimeout(cursorBroadcastTimeout.current)
    }
    
    // Only broadcast after 200ms of no cursor changes
    cursorBroadcastTimeout.current = setTimeout(() => {
      if (channelRef.current && cursorPosition && userId && userId !== 'pending') {
        channelRef.current.send({
          type: 'broadcast',
          event: 'cursor-change',
          payload: {
            userId,
            username: currentUser?.username || 'Anonymous',
            color: currentUser?.color || generateUserColor(),
            position: cursorPosition,
            selection: null,
          },
        })
      }
    }, 200)
    
    return () => {
      if (cursorBroadcastTimeout.current) {
        clearTimeout(cursorBroadcastTimeout.current)
      }
    }
  }, [cursorPosition, userId, currentUser])

  return {
    isConnected: useSessionStore((state) => state.isConnected),
    channel: channelRef.current,
  }
}

// Helper function to generate random user colors
function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#DA77F2', '#4C6EF5', '#15AABF',
    '#FF8787', '#69DB7C', '#FFD43B', '#A78BFA'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}