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
  setCursor: (userId: string, cursor: CursorData) => void
  removeCursor: (userId: string) => void
  clearCursors: () => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
  cursors: new Map(),
  setCursor: (userId, cursor) =>
    set((state) => {
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
}))