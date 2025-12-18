# Troubleshooting Guide

## Error: "Failed to load daily challenge"

This error typically occurs due to one of the following issues:

### 1. Database Schema Issue (Most Common)

**Problem**: The `min_steps` column still exists in the `daily_challenges` table, causing INSERT operations to fail.

**Solution**: Run migration `007_drop_min_steps.sql` in your Neon database:

1. Go to your Neon project dashboard
2. Navigate to SQL Editor
3. Copy and paste this SQL:

```sql
-- Migration: Drop min_steps column (replaced by optimal_steps)
ALTER TABLE daily_challenges
  DROP COLUMN IF EXISTS min_steps;
```

4. Run the migration
5. Refresh your browser

### 2. Missing Word Pairs

**Problem**: No word pairs exist in the database for the required word lengths.

**Solution**: Run the word pair generation script:

```bash
npx tsx scripts/generateWordPairs.ts
```

Or if you have JSON files, import them:

```bash
npx tsx scripts/importPairsToDatabase.ts
```

### 3. Database Connection Issue

**Problem**: The `DATABASE_URL` environment variable is not set or incorrect.

**Solution**: 
1. Check that `.env.local` exists in the project root
2. Verify `DATABASE_URL` is set correctly:
   ```
   DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
   ```
3. Make sure there are no extra quotes or `psql` prefix in the connection string
4. Restart the dev server after changing `.env.local`

### 4. Check Server Logs

If the error persists, check the terminal where `npm run dev` is running. Look for:
- Database connection errors
- SQL constraint violations
- Missing table errors

### Quick Diagnostic Commands

1. **Check if word pairs exist:**
   ```bash
   npx tsx scripts/checkDatabasePairs.ts
   ```

2. **Verify database connection:**
   - Check `.env.local` file exists
   - Verify `DATABASE_URL` format is correct
   - Test connection in Neon dashboard

3. **Check if migrations are applied:**
   - Go to Neon SQL Editor
   - Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_challenges';`
   - Verify `min_steps` column does NOT exist
   - Verify `optimal_steps` column DOES exist

### Expected Database Schema

The `daily_challenges` table should have these columns:
- `id` (UUID)
- `date` (DATE)
- `word_length` (INTEGER)
- `start_word` (TEXT)
- `end_word` (TEXT)
- `optimal_steps` (INTEGER) ✅
- `max_moves` (INTEGER)
- `created_at` (TIMESTAMP)
- `min_steps` (INTEGER) ❌ Should NOT exist

