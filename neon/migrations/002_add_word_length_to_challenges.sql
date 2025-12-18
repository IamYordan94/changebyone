-- Migration: Add word_length support for multiple puzzles per day
-- This allows 6 puzzles per day (one for each word length 3-8)

-- Add new columns to daily_challenges
ALTER TABLE daily_challenges 
  ADD COLUMN IF NOT EXISTS word_length INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS optimal_steps INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_moves INTEGER NOT NULL DEFAULT 8;

-- Drop old unique constraint on date
ALTER TABLE daily_challenges 
  DROP CONSTRAINT IF EXISTS daily_challenges_date_key;

-- Add new unique constraint on (date, word_length)
ALTER TABLE daily_challenges 
  ADD CONSTRAINT daily_challenges_date_length_unique 
  UNIQUE (date, word_length);

-- Remove difficulty column (replaced by word_length)
ALTER TABLE daily_challenges 
  DROP COLUMN IF EXISTS difficulty;

-- Update index to include word_length
DROP INDEX IF EXISTS idx_daily_challenges_date;
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_length ON daily_challenges(date, word_length);

-- Add word_length to user_solutions for leaderboard filtering
ALTER TABLE user_solutions 
  ADD COLUMN IF NOT EXISTS word_length INTEGER NOT NULL DEFAULT 3;

-- Update index for user_solutions to include word_length
DROP INDEX IF EXISTS idx_user_solutions_challenge_date;
CREATE INDEX IF NOT EXISTS idx_user_solutions_challenge_date_length ON user_solutions(challenge_date, word_length);

