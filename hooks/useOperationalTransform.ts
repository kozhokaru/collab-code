'use client'

import { useCallback, useRef } from 'react'

interface Operation {
  type: 'insert' | 'delete'
  position: number
  text?: string
  length?: number
  userId: string
  timestamp: number
}

export function useOperationalTransform() {
  const pendingOps = useRef<Operation[]>([])
  const lastSyncedVersion = useRef<number>(0)

  const transformOperation = useCallback((op1: Operation, op2: Operation): Operation => {
    // Transform op1 against op2
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1
      } else if (op1.position > op2.position) {
        return {
          ...op1,
          position: op1.position + (op2.text?.length || 0)
        }
      } else {
        // Same position - use userId as tiebreaker
        if (op1.userId < op2.userId) {
          return op1
        } else {
          return {
            ...op1,
            position: op1.position + (op2.text?.length || 0)
          }
        }
      }
    }

    if (op1.type === 'delete' && op2.type === 'delete') {
      const op1End = op1.position + (op1.length || 0)
      const op2End = op2.position + (op2.length || 0)

      if (op1End <= op2.position) {
        // op1 is before op2, no transformation needed
        return op1
      } else if (op1.position >= op2End) {
        // op1 is after op2, shift position
        return {
          ...op1,
          position: op1.position - (op2.length || 0)
        }
      } else {
        // Overlapping deletes
        if (op1.position < op2.position) {
          return {
            ...op1,
            length: Math.min(op1.length || 0, op2.position - op1.position)
          }
        } else {
          return {
            ...op1,
            position: op2.position,
            length: Math.max(0, op1End - op2End)
          }
        }
      }
    }

    if (op1.type === 'insert' && op2.type === 'delete') {
      const op2End = op2.position + (op2.length || 0)
      
      if (op1.position <= op2.position) {
        return op1
      } else if (op1.position >= op2End) {
        return {
          ...op1,
          position: op1.position - (op2.length || 0)
        }
      } else {
        return {
          ...op1,
          position: op2.position
        }
      }
    }

    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1
      } else {
        return {
          ...op1,
          position: op1.position + (op2.text?.length || 0)
        }
      }
    }

    return op1
  }, [])

  const applyOperation = useCallback((text: string, op: Operation): string => {
    if (op.type === 'insert') {
      return text.slice(0, op.position) + (op.text || '') + text.slice(op.position)
    } else if (op.type === 'delete') {
      return text.slice(0, op.position) + text.slice(op.position + (op.length || 0))
    }
    return text
  }, [])

  const mergeOperations = useCallback((localOp: Operation, remoteOps: Operation[]): Operation => {
    let transformedOp = localOp
    
    for (const remoteOp of remoteOps) {
      transformedOp = transformOperation(transformedOp, remoteOp)
    }
    
    return transformedOp
  }, [transformOperation])

  const addPendingOperation = useCallback((op: Operation) => {
    pendingOps.current.push(op)
  }, [])

  const getPendingOperations = useCallback((): Operation[] => {
    return pendingOps.current
  }, [])

  const clearPendingOperations = useCallback(() => {
    pendingOps.current = []
  }, [])

  const updateSyncedVersion = useCallback((version: number) => {
    lastSyncedVersion.current = version
  }, [])

  return {
    transformOperation,
    applyOperation,
    mergeOperations,
    addPendingOperation,
    getPendingOperations,
    clearPendingOperations,
    updateSyncedVersion,
    lastSyncedVersion: lastSyncedVersion.current
  }
}