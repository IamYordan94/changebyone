-- Table to store pre-generated verified word pairs
-- This allows deterministic selection of puzzles for each day

CREATE TABLE IF NOT EXISTS word_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_length INTEGER NOT NULL,
  start_word TEXT NOT NULL,
  end_word TEXT NOT NULL,
  optimal_steps INTEGER NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup by word length
CREATE INDEX IF NOT EXISTS idx_word_pairs_length ON word_pairs(word_length);

-- Index for unique pairs (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_word_pairs_unique ON word_pairs(word_length, start_word, end_word);

