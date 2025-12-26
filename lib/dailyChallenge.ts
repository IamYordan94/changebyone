import { sql } from './db';
import type { DailyChallenge, DailyChallengeRow, Puzzle, Difficulty } from '@/types';
import { calculateOptimalPath, findOptimalPathLength, calculateDifficulty } from './gameLogic';
import { getWordsByLength, isValidWord } from './words';

/**
 * Normalize date to UTC midnight to ensure consistent date strings
 */
function normalizeDate(date: Date): string {
  // Create a new date at UTC midnight for the given date
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate.toISOString().split('T')[0];
}

/**
 * Get the earliest date that has available word pairs in the schedule
 * Returns null if no dates are available
 */
export async function getEarliestAvailableDate(): Promise<string | null> {
  try {
    // Find the earliest date that has at least one word pair assigned
    const resultQuery = await sql`
      SELECT MIN(schedule_date) as earliest_date
      FROM daily_schedule
      WHERE word_pair_id IS NOT NULL
    `;

    const result = Array.isArray(resultQuery) ? resultQuery : [];
    
    if (result.length === 0) {
      return null;
    }

    const firstResult = result[0] as { earliest_date: Date | string | null } | undefined;
    
    if (!firstResult || !firstResult.earliest_date) {
      return null;
    }

    const earliestDate = firstResult.earliest_date;
    // Convert to YYYY-MM-DD format
    if (earliestDate instanceof Date) {
      return normalizeDate(earliestDate);
    }
    return earliestDate as string;
  } catch (error) {
    console.error('Error finding earliest available date:', error);
    return null;
  }
}

/**
 * Get all puzzles for a specific date (new multi-puzzle system)
 */
export async function getDailyChallenge(date: Date = new Date()): Promise<DailyChallenge | null> {
  const dateStr = normalizeDate(date);

  // Cast date column to DATE type to ensure proper comparison
  const resultQuery = await sql`
    SELECT * FROM daily_challenges 
    WHERE date::date = ${dateStr}::date
    ORDER BY word_length ASC
  `;

  const result = Array.isArray(resultQuery) ? resultQuery : [];

  if (result.length === 0) {
    return null;
  }

  // Convert database rows to Puzzle format
  const puzzles: Puzzle[] = (result as DailyChallengeRow[]).map(row => ({
    length: row.word_length,
    start_word: row.start_word,
    end_word: row.end_word,
    optimal_steps: row.optimal_steps,
    max_moves: row.max_moves,
  }));

  return {
    date: dateStr,
    puzzles,
  };
}

/**
 * Get a word pair from the daily schedule table
 */
async function getWordPairForDate(
  date: Date,
  wordLength: number
): Promise<{ start_word: string; end_word: string; optimal_steps: number } | null> {
  const dateStr = normalizeDate(date);

  try {
    // Query schedule table and join with word_pairs
    const resultQuery = await sql`
      SELECT wp.start_word, wp.end_word, wp.optimal_steps
      FROM daily_schedule ds
      INNER JOIN word_pairs wp ON ds.word_pair_id = wp.id
      WHERE ds.schedule_date = ${dateStr}::date
        AND ds.word_length = ${wordLength}
    `;

    const result = Array.isArray(resultQuery) ? resultQuery : [];

    if (result.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`No pair scheduled for date ${dateStr} and length ${wordLength}`);
      }
      return null;
    }

    return result[0] as { start_word: string; end_word: string; optimal_steps: number };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching scheduled pair for length ${wordLength}:`, error);
    }
    throw error;
  }
}

/**
 * Create a puzzle for a specific date and word length
 */
async function createPuzzleForDate(
  date: Date,
  wordLength: number
): Promise<DailyChallengeRow> {
  const dateStr = normalizeDate(date);

  // Get word pair from schedule
  const pair = await getWordPairForDate(date, wordLength);

  if (!pair) {
    throw new Error(`No pair scheduled for date ${dateStr} and length ${wordLength}. Please run populateDailySchedule.ts and fillScheduleGaps.ts to populate the schedule.`);
  }

  // Insert into daily_challenges
  try {
    const resultQuery = await sql`
      INSERT INTO daily_challenges (date, word_length, start_word, end_word, optimal_steps, max_moves)
      VALUES (${dateStr}, ${wordLength}, ${pair.start_word}, ${pair.end_word}, ${pair.optimal_steps}, 10)
      ON CONFLICT (date, word_length) DO UPDATE
      SET start_word = EXCLUDED.start_word,
          end_word = EXCLUDED.end_word,
          optimal_steps = EXCLUDED.optimal_steps,
          max_moves = EXCLUDED.max_moves
      RETURNING *
    `;

    const result = Array.isArray(resultQuery) ? resultQuery : [];

    if (!result || result.length === 0) {
      throw new Error(`Failed to create puzzle for length ${wordLength}`);
    }

    return result[0] as DailyChallengeRow;
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error(`Database error creating puzzle for length ${wordLength}:`, {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
    }

    // Provide more detailed error message for database issues
    if (error instanceof Error) {
      const errorMsg = error.message;

      if (errorMsg.includes('min_steps') || errorMsg.includes('23502')) {
        throw new Error(`Database schema error: The 'min_steps' column still exists. Please run migration 007_drop_min_steps.sql in your Neon database. Original error: ${errorMsg}`);
      }
      if (errorMsg.includes('column') || errorMsg.includes('relation') || errorMsg.includes('constraint')) {
        throw new Error(`Database schema error: ${errorMsg}. Please ensure all migrations are applied.`);
      }
      if (errorMsg.includes('null value') || errorMsg.includes('NOT NULL')) {
        throw new Error(`Database constraint error: ${errorMsg}. Check that all required columns exist and have correct types.`);
      }
    }
    throw error;
  }
}

/**
 * Ensure all 6 puzzles exist for a date, create missing ones
 */
export async function ensureDailyChallengeExists(
  date: Date = new Date()
): Promise<DailyChallenge> {
  const dateStr = normalizeDate(date);
  const wordLengths = [3, 4, 5, 6, 7, 8];

  // Check which puzzles already exist
  const existingQuery = await sql`
    SELECT word_length FROM daily_challenges 
    WHERE date::date = ${dateStr}::date
  `;

  const existing = Array.isArray(existingQuery) ? existingQuery : [];

  const existingLengths = new Set((existing as { word_length: number }[]).map(r => r.word_length));

  // Create missing puzzles
  const errors: string[] = [];
  let createdCount = 0;

  for (const length of wordLengths) {
    if (!existingLengths.has(length)) {
      try {
        await createPuzzleForDate(date, length);
        createdCount++;
        if (process.env.NODE_ENV === 'development') {
          console.log(`✓ Successfully created puzzle for length ${length}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        if (process.env.NODE_ENV === 'development') {
          console.error(`✗ Failed to create puzzle for length ${length}:`, errorMessage);
          if (errorStack) {
            console.error('Stack trace:', errorStack);
          }
        }
        errors.push(`Length ${length}: ${errorMessage}`);
        // Continue with other lengths
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`✓ Puzzle for length ${length} already exists`);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`Created ${createdCount} new puzzles, ${errors.length} errors, ${existingLengths.size} already existed`);
  }

  // Get all puzzles for this date
  // Add a small delay to ensure database consistency
  await new Promise(resolve => setTimeout(resolve, 100));

  // Try to get the challenge, with retry logic
  let challenge = await getDailyChallenge(date);

  // If not found, try querying directly from database as fallback
  if (!challenge || challenge.puzzles.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`getDailyChallenge returned empty, querying database directly for date ${dateStr}`);
    }

    // Direct database query as fallback
    const directResultQuery = await sql`
      SELECT * FROM daily_challenges 
      WHERE date::date = ${dateStr}::date
      ORDER BY word_length ASC
    `;

    const directResult = Array.isArray(directResultQuery) ? directResultQuery : [];

    if (directResult.length > 0) {
      const puzzles: Puzzle[] = (directResult as DailyChallengeRow[]).map(row => ({
        length: row.word_length,
        start_word: row.start_word,
        end_word: row.end_word,
        optimal_steps: row.optimal_steps,
        max_moves: row.max_moves,
      }));

      challenge = {
        date: dateStr,
        puzzles,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`Direct query found ${puzzles.length} puzzles`);
      }
    }
  }

  if (!challenge || challenge.puzzles.length === 0) {
    const errorDetails = errors.length > 0
      ? ` Errors: ${errors.join('; ')}`
      : ` No puzzles were found after creation. Created ${createdCount} puzzles, but query returned 0.`;
    throw new Error(`Failed to create daily challenge.${errorDetails}`);
  }

  // If some puzzles failed to create, log warning but return what we have
  if (challenge.puzzles.length < wordLengths.length) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Only ${challenge.puzzles.length} out of ${wordLengths.length} puzzles created. Errors: ${errors.join('; ')}`);
    }
  }

  return challenge;
}


