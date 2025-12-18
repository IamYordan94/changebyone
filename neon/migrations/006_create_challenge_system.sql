-- Migration: Create challenge system for social sharing and competition
-- Allows users to challenge each other on daily puzzles

-- Challenges table - stores challenge information
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_code TEXT UNIQUE NOT NULL,
  challenger_id TEXT,
  challenge_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Challenge participants table - stores each participant's results
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id TEXT,
  session_id TEXT, -- For anonymous users
  completion_time_ms INTEGER,
  total_steps INTEGER,
  solution_paths JSONB, -- { "3": [...], "4": [...], ... }
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for challenge lookups
CREATE INDEX IF NOT EXISTS idx_challenges_code ON challenges(challenge_code);
CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(challenge_date, status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id, challenge_id);

-- Unique constraint: one participant per challenge (by user_id or session_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_participants_unique 
  ON challenge_participants(challenge_id, COALESCE(user_id, session_id));

