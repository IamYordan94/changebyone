-- Migration: Drop min_steps column (replaced by optimal_steps)
-- This column is no longer used after migration 002

ALTER TABLE daily_challenges
  DROP COLUMN IF EXISTS min_steps;

