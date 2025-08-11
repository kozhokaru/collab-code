import { create } from 'zustand'

interface CursorPosition {
  lineNumber: number
  column: number
  offset: number
}

interface Selection {
  start: number
  end: number
}

interface EditorState {
  code: string
  language: string
  cursorPosition: CursorPosition | null
  selection: Selection | null
  setCode: (code: string) => void
  setLanguage: (language: string) => void
  setCursorPosition: (position: CursorPosition) => void
  setSelection: (selection: Selection | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  code: '',
  language: 'javascript',
  cursorPosition: null,
  selection: null,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
  setSelection: (selection) => set({ selection }),
}))