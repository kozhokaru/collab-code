# Real-Time Multiplayer Code Editor

A collaborative code editor that enables multiple users to edit code simultaneously with real-time synchronization, built with Next.js 15, TypeScript, Supabase, and Monaco Editor.

## Features

- 🚀 **Real-time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- 👥 **Live Presence**: See active collaborators' cursors and selections in real-time
- 💾 **Auto-save & Persistence**: Code changes are automatically saved and persist across sessions
- 🔄 **Automatic Reconnection**: Seamlessly handles connection drops and reconnects
- 🤖 **AI Assistant**: Integrated Claude AI for code explanation, debugging, and improvements
- 🎨 **Syntax Highlighting**: Full language support with Monaco Editor
- 📤 **Export & Share**: Easy code export and session sharing capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Editor**: Monaco Editor
- **Real-time**: Supabase Realtime
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **State Management**: Zustand
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Anthropic API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collab-code
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

4. Set up Supabase database:
- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
- Enable Realtime for the tables: sessions, users, code_snapshots

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`

4. Deploy!

The application will be automatically deployed and accessible at your Vercel URL.

## Usage

1. **Create a Session**: Enter a session name and select a programming language
2. **Join a Session**: Click on an existing session or share the session URL
3. **Collaborate**: Start coding! Changes sync in real-time
4. **Use AI Assistant**: Click the sparkles icon to get AI help with your code
5. **Export Code**: Download your code or share the session link

## Project Structure

```
collab-code/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── editor/[id]/       # Editor page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ai/               # AI assistant components
│   ├── editor/           # Editor components
│   └── session/          # Session management
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   └── supabase/        # Supabase client and types
├── store/               # Zustand state stores
├── styles/              # CSS styles
└── supabase/           # Database schema
```

## Development

### Database Schema

The application uses three main tables:
- `sessions`: Stores code editing sessions
- `users`: Tracks active collaborators
- `code_snapshots`: Maintains version history

### Real-time Features

Real-time synchronization is handled through:
- Supabase Realtime channels for presence and broadcasts
- Operational Transformation for conflict resolution
- Auto-save with debouncing for performance

### AI Integration

The AI assistant provides:
- Code explanation
- Bug detection and fixes
- Code improvements
- Code completion

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.