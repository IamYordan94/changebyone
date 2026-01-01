-- Migration: Add username and remove timer tracking
-- This migration converts the game from time-based to step-based competition

-- Add username column to user_solutions
ALTER TABLE user_solutions 
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Add username column to daily_completions
ALTER TABLE daily_completions 
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Remove timer-related columns from user_solutions
ALTER TABLE user_solutions 
  DROP COLUMN IF EXISTS completion_time_ms,
  DROP COLUMN IF EXISTS puzzle_start_time,
  DROP COLUMN IF EXISTS puzzle_end_time;

-- Remove timer-related columns from daily_completions
ALTER TABLE daily_completions 
  DROP COLUMN IF EXISTS total_time_ms,
  DROP COLUMN IF EXISTS completion_times;

-- Drop old time-based indexes
DROP INDEX IF EXISTS idx_user_solutions_time;
DROP INDEX IF EXISTS idx_daily_completions_date_time;

-- Create new step-based indexes
CREATE INDEX IF NOT EXISTS idx_user_solutions_steps ON user_solutions(challenge_date, word_length, steps);
CREATE INDEX IF NOT EXISTS idx_daily_completions_steps ON daily_completions(challenge_date, total_steps);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_solutions_username ON user_solutions(username);
CREATE INDEX IF NOT EXISTS idx_daily_completions_username ON daily_completions(username);
