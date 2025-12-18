/**
 * Script to fill gaps in daily_schedule by generating and assigning missing word pairs
 * Run with: npx tsx scripts/fillScheduleGaps.ts
 * 
 * This script:
 * 1. Reads current schedule status (what's assigned, what's missing)
 * 2. Generates only the missing pairs needed
 * 3. Auto-assigns newly generated pairs to NULL dates in schedule
 * 4. Reports results
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

// Dynamically import modules after env vars are loaded
let sql: any;

const WORD_LENGTHS = [3, 4, 5, 6, 7, 8];
const MAX_STEPS = 10;
const TARGET_PAIRS_PER_LEVEL = 365; // Target 365 pairs per level
const MAX_PAIRS_PER_RUN = 10; // Generate max 10 pairs per level per run

// Import word utilities
import { loadWordsFromJSON, getWordsByLength } from '../lib/words';
import { verifyWordPair } from '../lib/wordPairVerifier';

// Load words dictionary
try {
  const wordsPath = join(process.cwd(), 'public', 'words.json');
  const wordsData = JSON.parse(readFileSync(wordsPath, 'utf-8'));
  loadWordsFromJSON(wordsData);
  console.log('Word dictionary loaded');
} catch (error) {
  console.error('Error loading words.json:', error);
  process.exit(1);
}

/**
 * Retry logic for database operations
 */
async function insertWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Get max attempts for a word length
 */
function getMaxAttemptsForLength(length: number): number {
  if (length <= 5) return 20000;
  if (length === 6) return 50000;
  if (length === 7) return 75000;
  if (length === 8) return 100000;
  return 20000;
}

/**
 * Generate word pairs for a specific length
 */
async function generatePairsForLength(
  wordLength: number,
  targetCount: number
): Promise<Array<{ id: string; start_word: string; end_word: string; optimal_steps: number }>> {
  console.log(`\n  Generating ${targetCount} pairs for ${wordLength}-letter words...`);
  
  const words = getWordsByLength(wordLength);
  if (words.length < 2) {
    console.log(`  ⚠ Not enough words, skipping...`);
    return [];
  }

  const generated: Array<{ id: string; start_word: string; end_word: string; optimal_steps: number }> = [];
  let attempts = 0;
  const seenPairs = new Set<string>();

  // Get existing pairs to avoid duplicates
  try {
    const existing = await sql`
      SELECT start_word, end_word FROM word_pairs 
      WHERE word_length = ${wordLength}
    `;
    existing.forEach((row: any) => {
      const key = `${row.start_word}-${row.end_word}`;
      seenPairs.add(key);
    });
  } catch (error) {
    console.error(`  ⚠ Error fetching existing pairs: ${error}`);
  }

  const startTime = Date.now();
  const maxAttempts = getMaxAttemptsForLength(wordLength);
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  while (generated.length < targetCount && attempts < maxAttempts) {
    attempts++;

    // Random selection
    const startIdx = Math.floor(Math.random() * shuffledWords.length);
    const endIdx = Math.floor(Math.random() * shuffledWords.length);
    const startWord = shuffledWords[startIdx];
    const endWord = shuffledWords[endIdx];

    // Skip if same word
    if (startWord === endWord) continue;

    // Check if pair already seen
    const pairKey1 = `${startWord}-${endWord}`;
    const pairKey2 = `${endWord}-${startWord}`;
    if (seenPairs.has(pairKey1) || seenPairs.has(pairKey2)) continue;

    // Verify the pair
    const verification = verifyWordPair(startWord, endWord, MAX_STEPS);

    if (verification.isValid) {
      try {
        // Insert into database
        const result = await insertWithRetry(async () => {
          return await sql`
            INSERT INTO word_pairs (word_length, start_word, end_word, optimal_steps)
            VALUES (${wordLength}, ${startWord.toLowerCase()}, ${endWord.toLowerCase()}, ${verification.optimalSteps})
            ON CONFLICT (word_length, start_word, end_word) DO NOTHING
            RETURNING id, start_word, end_word, optimal_steps
          `;
        });

        if (result && result.length > 0) {
          seenPairs.add(pairKey1);
          generated.push(result[0] as { id: string; start_word: string; end_word: string; optimal_steps: number });
          
          if (generated.length % 10 === 0) {
            console.log(`    Generated ${generated.length}/${targetCount} pairs...`);
          }
        }
      } catch (error) {
        // Continue on error
      }
    }

    // Progress update
    if (attempts % 5000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`    Progress: ${attempts} attempts, ${generated.length} generated (${elapsed}s)`);
    }
  }

  return generated;
}

async function main() {
  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;

    console.log('\n🔍 Analyzing Schedule Gaps\n');
    console.log('='.repeat(60));

    // Step 1: Read Current Status
    console.log('\n📊 Current Status:\n');

    interface LevelStats {
      length: number;
      totalScheduled: number;
      assigned: number;
      missing: number;
      existingPairs: number;
      needed: number;
    }

    const stats: LevelStats[] = [];

    for (const length of WORD_LENGTHS) {
      // Get schedule stats
      const scheduleStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(word_pair_id) as assigned,
          COUNT(*) - COUNT(word_pair_id) as missing
        FROM daily_schedule
        WHERE word_length = ${length}
      `;
      const { total, assigned, missing } = scheduleStats[0] as { total: number; assigned: number; missing: number };

      // Get existing pairs count
      const pairsCount = await sql`
        SELECT COUNT(*) as count
        FROM word_pairs
        WHERE word_length = ${length}
      `;
      const existingPairs = Number(pairsCount[0]?.count || 0);

      // Calculate how many pairs are already assigned (to avoid double-counting)
      const assignedPairs = await sql`
        SELECT COUNT(DISTINCT word_pair_id) as count
        FROM daily_schedule
        WHERE word_length = ${length} AND word_pair_id IS NOT NULL
      `;
      const uniqueAssigned = Number(assignedPairs[0]?.count || 0);

      // Calculate needed: target is 365 pairs per level
      // But only generate up to MAX_PAIRS_PER_RUN at a time
      const targetPairs = TARGET_PAIRS_PER_LEVEL;
      const pairsToGenerate = Math.min(targetPairs - existingPairs, MAX_PAIRS_PER_RUN);
      const needed = Math.max(0, pairsToGenerate);

      stats.push({
        length,
        totalScheduled: Number(total),
        assigned: Number(assigned),
        missing: Number(missing),
        existingPairs,
        needed,
      });
    }

    // Display status table
    console.log('Word Length | Scheduled | Assigned | Missing | Existing Pairs | Needed');
    console.log('-'.repeat(70));
    for (const stat of stats) {
      console.log(
        `     ${stat.length}      |   ${stat.totalScheduled.toString().padStart(4)}    |  ${stat.assigned.toString().padStart(4)}   |  ${stat.missing.toString().padStart(4)}  |      ${stat.existingPairs.toString().padStart(4)}      |  ${stat.needed.toString().padStart(4)}`
      );
    }

    // Check if all levels are at target
    const allAtTarget = stats.every(s => s.existingPairs >= TARGET_PAIRS_PER_LEVEL);
    const totalMissing = stats.reduce((sum, s) => sum + s.missing, 0);
    const totalNeeded = stats.reduce((sum, s) => sum + s.needed, 0);

    if (allAtTarget && totalMissing === 0) {
      console.log('\n✅ All levels have reached target (365 pairs) and all schedule entries are assigned! No gaps to fill.\n');
      return;
    }

    console.log(`\n📋 Summary: Targeting ${TARGET_PAIRS_PER_LEVEL} pairs per level, generating up to ${MAX_PAIRS_PER_RUN} per level this run\n`);

    // Step 2: Generate Missing Pairs
    if (totalNeeded > 0) {
      console.log('🔨 Generating Missing Pairs\n');
      console.log('='.repeat(60));

      const allGenerated: Array<{ length: number; pairs: Array<{ id: string; start_word: string; end_word: string; optimal_steps: number }> }> = [];

      for (const stat of stats) {
        // Skip if already at target (365 pairs)
        if (stat.existingPairs >= TARGET_PAIRS_PER_LEVEL) {
          console.log(`  ⊘ Skipping ${stat.length}-letter words (already has ${stat.existingPairs} pairs, target: ${TARGET_PAIRS_PER_LEVEL})`);
          continue;
        }
        
        if (stat.needed > 0) {
          const generated = await generatePairsForLength(stat.length, stat.needed);
          allGenerated.push({ length: stat.length, pairs: generated });
          console.log(`  ✓ Generated ${generated.length}/${stat.needed} pairs for ${stat.length}-letter words`);
        }
      }

      // Step 3: Auto-Assign to Schedule
      if (allGenerated.length > 0) {
        console.log('\n📅 Auto-Assigning Pairs to Schedule\n');
        console.log('='.repeat(60));

        let totalAssigned = 0;

        for (const { length, pairs } of allGenerated) {
          for (const pair of pairs) {
            // Find first NULL date for this word length
            const nullDate = await sql`
              SELECT id, schedule_date
              FROM daily_schedule
              WHERE word_length = ${length} AND word_pair_id IS NULL
              ORDER BY schedule_date ASC
              LIMIT 1
            `;

            if (nullDate && nullDate.length > 0) {
              await sql`
                UPDATE daily_schedule
                SET word_pair_id = ${pair.id}, updated_at = NOW()
                WHERE id = ${nullDate[0].id}
              `;
              totalAssigned++;
            }
          }
          console.log(`  ✓ Assigned ${pairs.length} pairs for ${length}-letter words`);
        }

        console.log(`\n  ✅ Total assigned: ${totalAssigned} pairs`);
      }
    }

    // Step 4: Report Final Results
    console.log('\n📊 Final Status\n');
    console.log('='.repeat(60));

    let finalMissing = 0;
    for (const length of WORD_LENGTHS) {
      const finalStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(word_pair_id) as assigned,
          COUNT(*) - COUNT(word_pair_id) as missing
        FROM daily_schedule
        WHERE word_length = ${length}
      `;
      const { total, assigned, missing } = finalStats[0] as { total: number; assigned: number; missing: number };
      const percentage = total > 0 ? ((assigned / total) * 100).toFixed(1) : '0.0';
      const status = missing === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${length}-letter: ${assigned}/${total} assigned (${percentage}%)`);
      finalMissing += Number(missing);
    }
    if (finalMissing === 0) {
      console.log('\n🎉 All gaps filled! Schedule is complete.\n');
    } else {
      console.log(`\n⚠️  ${finalMissing} gaps remaining. Run the script again to fill more.\n`);
    }

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

