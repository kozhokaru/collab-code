-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  language TEXT DEFAULT 'javascript',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create users table for tracking active collaborators
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  color TEXT NOT NULL,
  cursor_position INTEGER,
  selection_start INTEGER,
  selection_end INTEGER,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create code_snapshots table for version history
CREATE TABLE IF NOT EXISTS code_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_session_id ON users(session_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_code_snapshots_session_id ON code_snapshots(session_id);
CREATE INDEX idx_code_snapshots_version ON code_snapshots(version);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow public read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON users FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON code_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON code_snapshots FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up inactive users
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET is_active = false 
  WHERE last_seen < timezone('utc'::text, now()) - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;