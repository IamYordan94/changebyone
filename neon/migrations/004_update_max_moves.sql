-- Migration: Update max moves from 8 to 10
-- This improves game balance and makes pair generation easier

-- Update default max_moves for new records
ALTER TABLE daily_challenges 
  ALTER COLUMN max_moves SET DEFAULT 10;

-- Update existing daily_challenges to max_moves = 10
UPDATE daily_challenges 
  SET max_moves = 10 
  WHERE max_moves = 8;

-- Note: word_pairs table doesn't store max_moves, it's verified at generation time
-- The verification script will use the new 10-move limit going forward

