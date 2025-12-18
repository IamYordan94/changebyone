/**
 * Script to generate verified word pairs for daily challenges
 * Run with: npx tsx scripts/generateWordPairs.ts
 * 
 * This script:
 * 1. Loads words from words.json
 * 2. For each word length (3-8), generates verified word pairs
 * 3. Verifies each pair has a path <= 10 moves
 * 4. Stores valid pairs in the database
 */

// Load environment variables FIRST, before any imports that need them
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
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    }
  });
  console.log('Environment variables loaded from .env.local');
} catch (error) {
  console.error('Warning: Could not load .env.local file. Make sure DATABASE_URL is set.');
  console.error('Error:', error instanceof Error ? error.message : error);
}

// Now import modules that don't depend on DATABASE_URL
import { loadWordsFromJSON, getWordsByLength } from '../lib/words';
import { verifyWordPair } from '../lib/wordPairVerifier';

// We'll dynamically import db.ts after env vars are loaded
let sql: any;

// Configuration
const TARGET_PAIRS_PER_LENGTH = 100; // Reduced to 100 pairs per length
// Increase attempts for longer words (they're harder to find valid pairs)
const getMaxAttemptsForLength = (length: number): number => {
  if (length <= 5) return 20000;
  if (length === 6) return 50000;
  if (length === 7) return 75000;
  if (length === 8) return 100000;
  return 20000; // Default for any unexpected length
};
const WORD_LENGTHS = [3, 4, 5, 6, 7, 8];

// All word lengths use the same target (100 pairs)
const getTargetForLength = (length: number): number => {
  return TARGET_PAIRS_PER_LENGTH;
};

/**
 * Check existing pairs in database for each word length
 */
async function checkExistingPairs(): Promise<Map<number, number>> {
  const pairsMap = new Map<number, number>();
  
  try {
    for (const length of WORD_LENGTHS) {
      const result = await sql`
        SELECT COUNT(*) as count FROM word_pairs WHERE word_length = ${length}
      `;
      const count = result[0]?.count || 0;
      pairsMap.set(length, Number(count));
    }
  } catch (error) {
    console.error('Error checking existing pairs:', error);
    // Return empty map if check fails, will generate all
  }
  
  return pairsMap;
}

/**
 * Retry database operation with exponential backoff
 */
async function insertWithRetry(
  queryFn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection error
      const isConnectionError = 
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('ETIMEDOUT');
      
      if (isConnectionError && attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`  ⚠ Database connection error, retrying in ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a connection error or last attempt, throw
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Simple seeded random number generator for deterministic selection
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Generate word pairs for a specific word length
 */
async function generatePairsForLength(
  wordLength: number,
  targetCount: number
): Promise<number> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Generating pairs for ${wordLength}-letter words...`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    const words = getWordsByLength(wordLength);
    console.log(`  ✓ Found ${words.length} words of length ${wordLength}`);

    if (words.length < 2) {
      console.log(`  ⚠ Not enough words, skipping...`);
      return 0;
    }

    let generated = 0;
    let attempts = 0;
    let validPairsFound = 0;
    let invalidPairsFound = 0;
    let failedInserts = 0;
    const seenPairs = new Set<string>();

    // Check existing pairs in database
    console.log(`  Checking existing pairs in database...`);
    let existing: any[] = [];
    try {
      existing = await insertWithRetry(async () => {
        return await sql`
          SELECT start_word, end_word FROM word_pairs 
          WHERE word_length = ${wordLength}
        `;
      });
    } catch (error) {
      console.error(`  ⚠ Error fetching existing pairs: ${error}`);
      // Continue with empty existing array
    }
    
    existing.forEach((row: any) => {
      const key = `${row.start_word}-${row.end_word}`;
      seenPairs.add(key);
    });

    console.log(`  ✓ Found ${existing.length} existing pairs in database`);
    console.log(`  Starting generation (target: ${targetCount} pairs)...\n`);

    const startTime = Date.now();
    let lastProgressTime = startTime;
    const maxAttempts = getMaxAttemptsForLength(wordLength);

    while (generated < targetCount && attempts < maxAttempts) {
      attempts++;
      
      // Show progress every 1000 attempts or every 30 seconds (whichever comes first)
      const now = Date.now();
      if (attempts % 1000 === 0 || (now - lastProgressTime) > 30000) {
        const elapsed = ((now - startTime) / 1000).toFixed(1);
        console.log(`  [${wordLength}-letter] Progress: ${attempts} attempts, ${generated} generated, ${validPairsFound} valid, ${invalidPairsFound} invalid (${elapsed}s elapsed)`);
        lastProgressTime = now;
      }

    // Random selection
    const startIdx = Math.floor(Math.random() * words.length);
    const endIdx = Math.floor(Math.random() * words.length);

    const startWord = words[startIdx];
    const endWord = words[endIdx];

    // Skip if same word
    if (startWord === endWord) {
      continue;
    }

    // Check if pair already seen
    const pairKey1 = `${startWord}-${endWord}`;
    const pairKey2 = `${endWord}-${startWord}`;
    if (seenPairs.has(pairKey1) || seenPairs.has(pairKey2)) {
      continue;
    }

    // Verify the pair
    const verification = verifyWordPair(startWord, endWord, 10);
    
    if (verification.isValid) {
      validPairsFound++;
      try {
        // Validate data before insertion
        if (!startWord || !endWord || typeof verification.optimalSteps !== 'number') {
          console.error(`  Invalid data for pair: start=${startWord}, end=${endWord}, steps=${verification.optimalSteps}`);
          continue;
        }

        // Insert into database with retry logic
        const result = await insertWithRetry(async () => {
          return await sql`
            INSERT INTO word_pairs (word_length, start_word, end_word, optimal_steps)
            VALUES (${wordLength}, ${startWord.toLowerCase()}, ${endWord.toLowerCase()}, ${verification.optimalSteps})
            ON CONFLICT (word_length, start_word, end_word) DO NOTHING
            RETURNING id
          `;
        });

        // Only count as generated if it was actually inserted (not a conflict)
        if (result && result.length > 0) {
          seenPairs.add(pairKey1);
          generated++;
          
          if (generated % 10 === 0) {
            console.log(`  Generated ${generated}/${targetCount} pairs...`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error inserting pair for ${wordLength}-letter words:`);
        console.error(`    Start: "${startWord}" (${startWord.length} chars)`);
        console.error(`    End: "${endWord}" (${endWord.length} chars)`);
        console.error(`    Optimal steps: ${verification.optimalSteps}`);
        if (error instanceof Error) {
          console.error(`    Error message: ${error.message}`);
          if (error.stack) {
            console.error(`    Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
          }
        } else {
          console.error(`    Error object:`, error);
        }
        // Continue trying other pairs instead of stopping
        failedInserts++;
      }
    } else {
      invalidPairsFound++;
    }
  }

  console.log(`\n  ${'─'.repeat(50)}`);
  console.log(`  Summary for ${wordLength}-letter words:`);
  console.log(`    Total attempts: ${attempts}`);
  console.log(`    Valid pairs found: ${validPairsFound}`);
  console.log(`    Invalid pairs found: ${invalidPairsFound}`);
  console.log(`    Successfully generated: ${generated}`);
  console.log(`    Failed inserts: ${failedInserts}`);
  console.log(`    Target: ${targetCount}`);
  console.log(`  ${'─'.repeat(50)}\n`);
  
  return generated;
  } catch (error) {
    console.error(`\n  ❌ FATAL ERROR processing ${wordLength}-letter words:`);
    console.error(`    Error:`, error);
    if (error instanceof Error) {
      console.error(`    Message: ${error.message}`);
      console.error(`    Stack: ${error.stack}`);
    }
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting word pair generation...\n');

  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;
    
    // Check existing pairs first
    console.log('Checking existing pairs in database...');
    const existingPairs = await checkExistingPairs();
    
    console.log('\n📊 Existing pairs summary:');
    for (const length of WORD_LENGTHS) {
      const count = existingPairs.get(length) || 0;
      const target = getTargetForLength(length);
      const status = count >= target ? '✓' : '○';
      console.log(`  ${status} ${length}-letter words: ${count}/${target} pairs`);
    }
    console.log('');

    // Load words
    console.log('Loading words from words.json...');
    const publicPath = join(process.cwd(), 'public', 'words.json');
    const fileContents = readFileSync(publicPath, 'utf-8');
    const words = JSON.parse(fileContents);
    
    loadWordsFromJSON(words);
    console.log('Words loaded successfully\n');

    // Generate pairs for each length (skip if already have enough)
    let totalGenerated = 0;
    for (const length of WORD_LENGTHS) {
      const target = getTargetForLength(length);
      const existing = existingPairs.get(length) || 0;
      
      if (existing >= target) {
        console.log(`\n⏭️  Skipping ${length}-letter words: already have ${existing} pairs (target: ${target})\n`);
        continue;
      }
      
      const needed = target - existing;
      console.log(`\n🎯 Target for ${length}-letter words: ${target} pairs (${existing} existing, need ${needed} more)\n`);
      const count = await generatePairsForLength(length, target);
      totalGenerated += count;
    }

    console.log(`\n✅ Generation complete!`);
    console.log(`Total pairs generated: ${totalGenerated}`);
    
    const totalTarget = WORD_LENGTHS.reduce((sum, len) => sum + getTargetForLength(len), 0);
    console.log(`Total target was: ${totalTarget} pairs`);

    // Show final summary
    console.log('\n📊 Final summary by length:');
    for (const length of WORD_LENGTHS) {
      try {
        const count = await insertWithRetry(async () => {
          return await sql`
            SELECT COUNT(*) as count FROM word_pairs WHERE word_length = ${length}
          `;
        });
        const target = getTargetForLength(length);
        const current = count[0]?.count || 0;
        const status = current >= target ? '✓' : '○';
        console.log(`  ${status} ${length}-letter words: ${current}/${target} pairs`);
      } catch (error) {
        console.error(`  ⚠ Error getting count for ${length}-letter words: ${error}`);
      }
    }

  } catch (error) {
    console.error('Error generating word pairs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generatePairsForLength };

