import { create } from 'zustand'
import { Session, User } from '@/lib/supabase/types'

interface SessionState {
  session: Session | null
  currentUser: User | null
  collaborators: User[]
  isConnected: boolean
  setSession: (session: Session | null) => void
  setCurrentUser: (user: User | null) => void
  setCollaborators: (collaborators: User[]) => void
  addCollaborator: (user: User) => void
  removeCollaborator: (userId: string) => void
  updateCollaborator: (userId: string, updates: Partial<User>) => void
  setConnected: (connected: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  currentUser: null,
  collaborators: [],
  isConnected: false,
  setSession: (session) => set({ session }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setCollaborators: (collaborators) => set({ collaborators }),
  addCollaborator: (user) => 
    set((state) => ({ 
      collaborators: [...state.collaborators, user] 
    })),
  removeCollaborator: (userId) =>
    set((state) => ({
      collaborators: state.collaborators.filter(u => u.id !== userId)
    })),
  updateCollaborator: (userId, updates) =>
    set((state) => ({
      collaborators: state.collaborators.map(u =>
        u.id === userId ? { ...u, ...updates } : u
      )
    })),
  setConnected: (isConnected) => set({ isConnected }),
}))