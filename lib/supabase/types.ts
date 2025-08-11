export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          name: string
          code: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          session_id: string
          username: string
          color: string
          cursor_position: number | null
          selection_start: number | null
          selection_end: number | null
          is_active: boolean
          joined_at: string
          last_seen: string
        }
        Insert: {
          id?: string
          session_id: string
          username: string
          color: string
          cursor_position?: number | null
          selection_start?: number | null
          selection_end?: number | null
          is_active?: boolean
          joined_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          session_id?: string
          username?: string
          color?: string
          cursor_position?: number | null
          selection_start?: number | null
          selection_end?: number | null
          is_active?: boolean
          joined_at?: string
          last_seen?: string
        }
      }
      code_snapshots: {
        Row: {
          id: string
          session_id: string
          content: string
          version: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          session_id: string
          content: string
          version?: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          session_id?: string
          content?: string
          version?: number
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type CodeSnapshot = Database['public']['Tables']['code_snapshots']['Row']