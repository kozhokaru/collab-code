'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useSessionStore } from '@/store/sessionStore'

interface UsePersistenceOptions {
  sessionId: string
  userId: string
  autoSaveInterval?: number // in milliseconds
}

export function usePersistence({
  sessionId,
  userId,
  autoSaveInterval = 5000, // Auto-save every 5 seconds
}: UsePersistenceOptions) {
  const { code } = useEditorStore()
  const { session, isConnected } = useSessionStore()
  const lastSavedCode = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSaveTime = useRef<number>(Date.now())
  const isSaving = useRef<boolean>(false)

  // Save code to server
  const saveCode = useCallback(async (forceSnapshot = false) => {
    // Skip if userId is not ready or already saving
    if (!userId || userId === 'pending' || isSaving.current) {
      return
    }
    
    if (code === lastSavedCode.current && !forceSnapshot) {
      return // No changes to save
    }
    
    isSaving.current = true

    try {
      // Update session code
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          code,
        }),
      })

      // Create snapshot if significant time has passed or forced
      const timeSinceLastSave = Date.now() - lastSaveTime.current
      if (forceSnapshot || timeSinceLastSave > 30000) { // Snapshot every 30 seconds
        await fetch('/api/snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId,
            content: code,
          }),
        })
        lastSaveTime.current = Date.now()
      }

      lastSavedCode.current = code
      
      // Store in localStorage as backup
      localStorage.setItem(`session_${sessionId}_code`, code)
      localStorage.setItem(`session_${sessionId}_timestamp`, Date.now().toString())
    } catch (error) {
      console.error('Failed to save code:', error)
      // Still save to localStorage on error
      localStorage.setItem(`session_${sessionId}_code`, code)
      localStorage.setItem(`session_${sessionId}_backup`, 'true')
    } finally {
      isSaving.current = false
    }
  }, [code, sessionId, userId])

  // Load persisted code on mount
  const loadPersistedCode = useCallback(async () => {
    try {
      // First, try to load from server
      const response = await fetch(`/api/sessions?id=${sessionId}`)
      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData.code) {
          useEditorStore.getState().setCode(sessionData.code)
          lastSavedCode.current = sessionData.code
          return
        }
      }
    } catch (error) {
      console.error('Failed to load session from server:', error)
    }

    // Fallback to localStorage
    const localCode = localStorage.getItem(`session_${sessionId}_code`)
    const localTimestamp = localStorage.getItem(`session_${sessionId}_timestamp`)
    const isBackup = localStorage.getItem(`session_${sessionId}_backup`)

    if (localCode) {
      useEditorStore.getState().setCode(localCode)
      lastSavedCode.current = localCode

      // If this was a backup due to server error, try to sync it
      if (isBackup === 'true') {
        saveCode(true).then(() => {
          localStorage.removeItem(`session_${sessionId}_backup`)
        })
      }
    }
  }, [sessionId, saveCode])

  // Handle reconnection
  const handleReconnection = useCallback(() => {
    if (isConnected) {
      console.log('Reconnected to session, checking for unsaved changes...')
      
      // Check if we have unsaved changes
      const localCode = localStorage.getItem(`session_${sessionId}_code`)
      const localTimestamp = parseInt(localStorage.getItem(`session_${sessionId}_timestamp`) || '0')
      const currentTime = Date.now()
      
      // If local changes are recent (within last minute) and different, save them
      if (localCode && (currentTime - localTimestamp) < 60000) {
        if (localCode !== lastSavedCode.current && localCode !== code) {
          // Update the code store with local changes
          useEditorStore.getState().setCode(localCode)
          lastSavedCode.current = localCode
        }
      }
    }
  }, [isConnected, sessionId, code])

  // Auto-save effect
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set up new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(false)
    }, autoSaveInterval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [code, autoSaveInterval, saveCode])

  // Load persisted code on mount (only once)
  useEffect(() => {
    if (userId && userId !== 'pending') {
      loadPersistedCode()
    }
  }, [userId]) // Remove loadPersistedCode from deps to prevent loops

  // Handle reconnection
  useEffect(() => {
    if (isConnected && userId && userId !== 'pending') {
      handleReconnection()
    }
  }, [isConnected]) // Simplify deps to prevent loops

  // Save on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCode(true)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Final save on unmount
      saveCode(true)
    }
  }, [saveCode])

  return {
    saveCode,
    loadPersistedCode,
    isSaved: code === lastSavedCode.current,
  }
}