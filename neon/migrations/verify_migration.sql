-- Verification Script: Check what columns exist in your database
-- Run this to see the current state

-- Check user_solutions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_solutions'
ORDER BY ordinal_position;

-- Check daily_completions columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'daily_completions'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('user_solutions', 'daily_completions')
ORDER BY tablename, indexname;
