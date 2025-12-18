# Deployment Checklist

## ✅ Completed

1. **Code Completeness**
   - All TypeScript files compile without errors
   - All components and API routes are implemented
   - Production build succeeds (`npm run build`)

2. **Word Dictionary**
   - `public/words.json` exists and is properly formatted
   - Word loading logic is implemented for both client and server

3. **Build Status**
   - Production build completes successfully
   - All API routes marked as dynamic (no static generation errors)
   - No TypeScript compilation errors

## ⚠️ Required Before Deployment

### Database Migration

**IMPORTANT**: You must run migration `007_drop_min_steps.sql` in your Neon database before deploying.

The database schema still has a `min_steps` column that conflicts with the new `optimal_steps` column. This will cause errors when creating daily challenges.

**Steps:**
1. Go to your Neon project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `neon/migrations/007_drop_min_steps.sql`
4. Run the migration

**Migration SQL:**
```sql
-- Migration: Drop min_steps column (replaced by optimal_steps)
-- This column is no longer used after migration 002

ALTER TABLE daily_challenges
  DROP COLUMN IF EXISTS min_steps;
```

### Environment Variables

Ensure `.env.local` has:
- `DATABASE_URL` - Your Neon PostgreSQL connection string

For Vercel deployment:
1. Go to Vercel project settings
2. Add `DATABASE_URL` environment variable
3. Use the same connection string from your `.env.local`

## Testing Checklist

Before deploying, test locally:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test game flow:**
   - Load the homepage
   - Verify daily challenge loads (6 puzzles)
   - Play a puzzle (submit words)
   - Complete a puzzle and verify timer works
   - Check leaderboard displays
   - Test challenge creation/sharing

3. **Verify database:**
   - Run `npx tsx scripts/checkDatabasePairs.ts` to confirm word pairs exist
   - Check that daily challenges can be created

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository
   - Add `DATABASE_URL` environment variable
   - Deploy

3. **Post-deployment:**
   - Test the live site
   - Verify daily challenges generate correctly
   - Check that leaderboards work
   - Test challenge system

## Known Issues

None currently - all code issues have been resolved.

## Notes

- All API routes are marked as `dynamic = 'force-dynamic'` (expected for database queries)
- Word pairs are pre-generated and stored in the database
- Daily challenges are created on-demand from pre-generated pairs
- The game supports 6 puzzles per day (word lengths 3-8)

