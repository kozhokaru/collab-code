'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '@/store/sessionStore'

interface UseReconnectionOptions {
  maxRetries?: number
  retryDelay?: number // in milliseconds
  onReconnect?: () => void
  onDisconnect?: () => void
  onMaxRetriesReached?: () => void
}

export function useReconnection({
  maxRetries = 5,
  retryDelay = 3000,
  onReconnect,
  onDisconnect,
  onMaxRetriesReached,
}: UseReconnectionOptions = {}) {
  const { isConnected, setConnected } = useSessionStore()
  const retryCount = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const wasConnected = useRef(false)

  const checkConnection = useCallback(async () => {
    try {
      // Simple ping to check if server is reachable
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      return response.ok
    } catch (error) {
      return false
    }
  }, [])

  const attemptReconnection = useCallback(async () => {
    if (retryCount.current >= maxRetries) {
      console.error('Max reconnection attempts reached')
      onMaxRetriesReached?.()
      return
    }

    console.log(`Attempting reconnection... (attempt ${retryCount.current + 1}/${maxRetries})`)
    
    const connected = await checkConnection()
    
    if (connected) {
      console.log('Reconnection successful!')
      retryCount.current = 0
      setConnected(true)
      onReconnect?.()
    } else {
      retryCount.current++
      
      if (retryCount.current < maxRetries) {
        // Schedule next retry with exponential backoff
        const delay = retryDelay * Math.pow(1.5, retryCount.current - 1)
        console.log(`Reconnection failed, retrying in ${delay}ms...`)
        
        retryTimeoutRef.current = setTimeout(() => {
          attemptReconnection()
        }, delay)
      } else {
        onMaxRetriesReached?.()
      }
    }
  }, [maxRetries, retryDelay, checkConnection, setConnected, onReconnect, onMaxRetriesReached])

  // Monitor connection status
  useEffect(() => {
    if (!isConnected && wasConnected.current) {
      // Connection lost
      console.log('Connection lost, initiating reconnection...')
      onDisconnect?.()
      attemptReconnection()
    }
    
    wasConnected.current = isConnected
  }, [isConnected, attemptReconnection, onDisconnect])

  // Set up periodic connection check
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (isConnected) {
        const stillConnected = await checkConnection()
        if (!stillConnected) {
          setConnected(false)
        }
      }
    }, 10000) // Check every 10 seconds

    return () => {
      clearInterval(checkInterval)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [isConnected, checkConnection, setConnected])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored')
      if (!isConnected) {
        attemptReconnection()
      }
    }

    const handleOffline = () => {
      console.log('Network connection lost')
      setConnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isConnected, attemptReconnection, setConnected])

  return {
    isReconnecting: retryCount.current > 0 && retryCount.current < maxRetries,
    retryCount: retryCount.current,
    forceReconnect: attemptReconnection,
  }
}