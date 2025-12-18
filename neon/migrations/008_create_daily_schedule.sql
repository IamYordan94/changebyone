-- Migration: Create daily_schedule table for pre-generated puzzle assignments
-- This table maps dates to specific word pairs, allowing visibility and gap detection

CREATE TABLE IF NOT EXISTS daily_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date DATE NOT NULL,
  word_length INTEGER NOT NULL CHECK (word_length >= 3 AND word_length <= 8),
  word_pair_id UUID REFERENCES word_pairs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint: one schedule entry per date per word length
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_schedule_unique 
  ON daily_schedule(schedule_date, word_length);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_daily_schedule_date 
  ON daily_schedule(schedule_date);

-- Index for gap detection (finding NULL word_pair_id)
CREATE INDEX IF NOT EXISTS idx_daily_schedule_gaps 
  ON daily_schedule(word_length, word_pair_id) 
  WHERE word_pair_id IS NULL;

-- Index for word_pair_id lookups
CREATE INDEX IF NOT EXISTS idx_daily_schedule_pair 
  ON daily_schedule(word_pair_id) 
  WHERE word_pair_id IS NOT NULL;

