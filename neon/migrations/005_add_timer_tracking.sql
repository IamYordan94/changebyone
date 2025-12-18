-- Migration: Add timer tracking for puzzles and daily completions
-- This enables competitive leaderboards based on completion time

-- Add timer fields to user_solutions table
ALTER TABLE user_solutions 
  ADD COLUMN IF NOT EXISTS completion_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS puzzle_start_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS puzzle_end_time TIMESTAMP WITH TIME ZONE;

-- Create index for time-based leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_solutions_time ON user_solutions(challenge_date, word_length, completion_time_ms) 
  WHERE completion_time_ms IS NOT NULL;

-- Create daily_completions table for full daily challenge times
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  user_id TEXT,
  total_time_ms INTEGER NOT NULL,
  completion_times JSONB NOT NULL,  -- { "3": 45000, "4": 60000, "5": 55000, ... }
  solution_paths JSONB,  -- { "3": ["cat", "cot", "dot", "dog"], "4": [...], ... }
  total_steps INTEGER,  -- Total moves across all puzzles
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for daily completion leaderboard queries
CREATE INDEX IF NOT EXISTS idx_daily_completions_date_time ON daily_completions(challenge_date, total_time_ms);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_daily_completions_user ON daily_completions(user_id, challenge_date);

