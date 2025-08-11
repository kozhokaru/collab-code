import { create } from 'zustand'

interface CursorData {
  userId: string
  username: string
  color: string
  position: {
    lineNumber: number
    column: number
  }
  selection?: {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }
}

interface PresenceState {
  cursors: Map<string, CursorData>
  currentUserId: string | null
  setCursor: (userId: string, cursor: CursorData) => void
  removeCursor: (userId: string) => void
  clearCursors: () => void
  setCurrentUserId: (userId: string | null) => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
  cursors: new Map(),
  currentUserId: null,
  setCursor: (userId, cursor) =>
    set((state) => {
      // Never store current user's cursor
      if (userId === state.currentUserId) {
        console.warn(`Attempted to set current user cursor (${userId}), skipping`)
        return state
      }
      const newCursors = new Map(state.cursors)
      newCursors.set(userId, cursor)
      return { cursors: newCursors }
    }),
  removeCursor: (userId) =>
    set((state) => {
      const newCursors = new Map(state.cursors)
      newCursors.delete(userId)
      return { cursors: newCursors }
    }),
  clearCursors: () => set({ cursors: new Map() }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
}))