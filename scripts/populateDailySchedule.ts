/**
 * Script to populate daily_schedule table with 365 days of schedule entries
 * Run with: npx tsx scripts/populateDailySchedule.ts
 * 
 * This script:
 * 1. Generates 365 days starting from today
 * 2. Creates 6 rows per day (one per word length: 3-8)
 * 3. Uses deterministic logic to assign existing pairs
 * 4. Leaves word_pair_id as NULL where no pair exists yet
 * 5. Skips dates that already have entries (idempotent)
 */

// Load environment variables FIRST
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    }
  });
  console.log('Environment variables loaded from .env.local');
} catch (error) {
  console.error('Warning: Could not load .env.local file.');
}

// Dynamically import db after env vars are loaded
let sql: any;

const WORD_LENGTHS = [3, 4, 5, 6, 7, 8];
const DAYS_TO_SCHEDULE = 365;

/**
 * Normalize date to UTC midnight to ensure consistent date strings
 */
function normalizeDate(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate.toISOString().split('T')[0];
}

/**
 * Calculate which pair index should be used for a given date (deterministic logic)
 */
function calculatePairIndex(date: Date, totalPairs: number): number {
  const dateStr = normalizeDate(date);
  const seed = dateStr.split('-').join(''); // e.g., "20250115"
  const numericSeed = parseInt(seed, 10);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return (dayOfYear + numericSeed) % totalPairs;
}

async function main() {
  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;

    console.log('\n📅 Populating Daily Schedule\n');
    console.log('='.repeat(60));

    // Get all existing word pairs grouped by length
    console.log('Loading existing word pairs...');
    const pairsByLength: Record<number, Array<{ id: string; start_word: string; end_word: string; optimal_steps: number }>> = {};

    for (const length of WORD_LENGTHS) {
      const pairs = await sql`
        SELECT id, start_word, end_word, optimal_steps
        FROM word_pairs
        WHERE word_length = ${length}
        ORDER BY id
      `;
      pairsByLength[length] = pairs as Array<{ id: string; start_word: string; end_word: string; optimal_steps: number }>;
      console.log(`  ${length}-letter words: ${pairs.length} pairs available`);
    }

    // Generate dates (365 days starting from today)
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < DAYS_TO_SCHEDULE; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    console.log(`\nGenerating schedule for ${DAYS_TO_SCHEDULE} days (${dates[0].toISOString().split('T')[0]} to ${dates[dates.length - 1].toISOString().split('T')[0]})...`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalAssigned = 0;
    let totalNull = 0;

    // Process each date
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dateStr = normalizeDate(date);

      // Check if schedule entries already exist for this date
      const existing = await sql`
        SELECT word_length FROM daily_schedule
        WHERE schedule_date = ${dateStr}::date
      `;
      const existingLengths = new Set((existing as Array<{ word_length: number }>).map(r => r.word_length));

      if (existingLengths.size === WORD_LENGTHS.length) {
        totalSkipped += WORD_LENGTHS.length;
        if ((i + 1) % 50 === 0) {
          console.log(`  Processed ${i + 1}/${dates.length} dates...`);
        }
        continue;
      }

      // Create schedule entries for each word length
      for (const wordLength of WORD_LENGTHS) {
        if (existingLengths.has(wordLength)) {
          totalSkipped++;
          continue;
        }

        // Calculate which pair should be used (deterministic)
        const pairs = pairsByLength[wordLength];
        let wordPairId: string | null = null;

        if (pairs && pairs.length > 0) {
          const pairIndex = calculatePairIndex(date, pairs.length);
          wordPairId = pairs[pairIndex].id;
          totalAssigned++;
        } else {
          totalNull++;
        }

        // Insert schedule entry
        await sql`
          INSERT INTO daily_schedule (schedule_date, word_length, word_pair_id)
          VALUES (${dateStr}::date, ${wordLength}, ${wordPairId})
          ON CONFLICT (schedule_date, word_length) DO NOTHING
        `;
        totalCreated++;
      }

      if ((i + 1) % 50 === 0) {
        console.log(`  Processed ${i + 1}/${dates.length} dates...`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  ✓ Created: ${totalCreated} schedule entries`);
    console.log(`  ⊘ Skipped: ${totalSkipped} (already existed)`);
    console.log(`  ✓ Assigned: ${totalAssigned} pairs`);
    console.log(`  ⊗ Missing: ${totalNull} (no pairs available)`);
    console.log('='.repeat(60));

    // Show breakdown by word length
    console.log('\nBreakdown by word length:');
    for (const length of WORD_LENGTHS) {
      const stats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(word_pair_id) as assigned,
          COUNT(*) - COUNT(word_pair_id) as missing
        FROM daily_schedule
        WHERE word_length = ${length}
      `;
      const { total, assigned, missing } = stats[0] as { total: number; assigned: number; missing: number };
      const percentage = total > 0 ? ((assigned / total) * 100).toFixed(1) : '0.0';
      console.log(`  ${length}-letter: ${assigned}/${total} assigned (${percentage}%)`);
    }

    console.log('\n✅ Schedule population complete!\n');

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

