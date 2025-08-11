# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Real-Time Multiplayer Code Editor - A collaborative code editing platform with instant synchronization, AI assistance, and persistent sessions.

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Editor**: Monaco Editor
- **Real-time**: Supabase Realtime (WebSockets)
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Common Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing (when implemented)
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## Architecture

### Key Components

1. **Editor System** (`/components/editor/`)
   - `CodeEditor.tsx`: Monaco Editor wrapper with real-time sync
   - `CollaboratorPresence.tsx`: Shows active users
   - `CursorOverlay.tsx`: Renders remote cursors

2. **Real-time Sync** (`/hooks/`)
   - `useRealtimeSync.ts`: Manages Supabase channels and presence
   - `useOperationalTransform.ts`: Handles concurrent edit conflicts
   - `usePersistence.ts`: Auto-save and recovery
   - `useReconnection.ts`: Connection recovery with exponential backoff

3. **State Management** (`/store/`)
   - `editorStore.ts`: Code content and cursor positions
   - `sessionStore.ts`: Session and user data
   - `presenceStore.ts`: Collaborator cursor tracking

4. **API Routes** (`/app/api/`)
   - `/sessions`: CRUD operations for sessions
   - `/users`: User management
   - `/snapshots`: Version history
   - `/ai`: Claude AI integration
   - `/health`: Connection monitoring

### Real-time Architecture

The app uses Supabase Realtime for:
- **Presence**: Track online users and cursor positions
- **Broadcast**: Share code changes and cursor movements
- **Database Changes**: Listen to session updates

Conflict resolution uses Operational Transformation (OT) to merge concurrent edits.

### Data Flow

1. User types → Monaco Editor onChange
2. Change broadcasted via Supabase channel
3. Remote clients receive and apply transforms
4. Auto-save to database every 5 seconds
5. Snapshots created every 30 seconds

## Important Patterns

### Adding New Features

When adding features:
1. Create hooks in `/hooks/` for business logic
2. Use Zustand stores for shared state
3. Keep components in `/components/` focused
4. Add API routes in `/app/api/` for server operations

### Working with Real-time

Always consider:
- Connection state (connected/reconnecting/disconnected)
- Conflict resolution for concurrent edits
- Cleanup in useEffect returns
- Debouncing for performance

### Database Operations

- Use server-side Supabase client in API routes
- Client-side for real-time subscriptions
- Always handle offline scenarios with localStorage

## Environment Variables

Required for development:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key
- `ANTHROPIC_API_KEY`: For AI features

## Deployment Notes

- Deployed on Vercel
- Environment variables set in Vercel dashboard
- Database hosted on Supabase
- Real-time connections scale automatically