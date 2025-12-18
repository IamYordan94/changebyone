/**
 * Script to import generated word pairs JSON files into the database
 * Run with: npx tsx scripts/importPairsToDatabase.ts
 * 
 * This script:
 * 1. Reads word_pairs_6.json, word_pairs_7.json, word_pairs_8.json
 * 2. Imports them into the word_pairs table
 * 3. Skips duplicates (handled by unique constraint)
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
  console.error('Warning: Could not load .env.local file. Make sure DATABASE_URL is set.');
  console.error('Error:', error instanceof Error ? error.message : error);
}

// Dynamically import db after env vars are loaded
let sql: any;

interface WordPair {
  start_word: string;
  end_word: string;
  optimal_steps: number;
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
      
      const isConnectionError = 
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('ETIMEDOUT');
      
      if (isConnectionError && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`   ⚠ Connection error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * Import pairs from a JSON file
 */
async function importPairsFromFile(
  filePath: string,
  wordLength: number
): Promise<{ imported: number; skipped: number; errors: number }> {
  console.log(`\n📥 Importing ${wordLength}-letter pairs from ${filePath}...`);
  
  try {
    const fileContents = readFileSync(filePath, 'utf-8');
    const pairs: WordPair[] = JSON.parse(fileContents);
    
    console.log(`   Found ${pairs.length} pairs in file`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      
      try {
        const result = await insertWithRetry(async () => {
          return await sql`
            INSERT INTO word_pairs (word_length, start_word, end_word, optimal_steps)
            VALUES (${wordLength}, ${pair.start_word.toLowerCase()}, ${pair.end_word.toLowerCase()}, ${pair.optimal_steps})
            ON CONFLICT (word_length, start_word, end_word) DO NOTHING
            RETURNING id
          `;
        });
        
        if (result && result.length > 0) {
          imported++;
          if (imported % 10 === 0) {
            console.log(`   ✓ Imported ${imported}/${pairs.length}...`);
          }
        } else {
          skipped++; // Duplicate, skipped by ON CONFLICT
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error importing pair ${i + 1}: ${pair.start_word} → ${pair.end_word}`);
        if (error instanceof Error) {
          console.error(`      Error: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ Imported: ${imported}, Skipped (duplicates): ${skipped}, Errors: ${errors}`);
    
    return { imported, skipped, errors };
  } catch (error) {
    console.error(`   ❌ Error reading file ${filePath}:`, error);
    return { imported: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting word pairs import...\n');
  
  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;
    
    const WORD_LENGTHS = [6, 7, 8];
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    // Import each file
    for (const length of WORD_LENGTHS) {
      const filePath = join(process.cwd(), `word_pairs_${length}.json`);
      
      try {
        // Check if file exists
        readFileSync(filePath, 'utf-8');
        
        const result = await importPairsFromFile(filePath, length);
        totalImported += result.imported;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          console.log(`   ⚠ File not found: word_pairs_${length}.json (skipping)`);
        } else {
          console.error(`   ❌ Error with file word_pairs_${length}.json:`, error);
          totalErrors++;
        }
      }
    }
    
    // Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Import complete!`);
    console.log(`   Total imported: ${totalImported}`);
    console.log(`   Total skipped (duplicates): ${totalSkipped}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Show current database counts
    console.log('📊 Current database counts:');
    for (const length of WORD_LENGTHS) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count FROM word_pairs WHERE word_length = ${length}
        `;
        const count = result[0]?.count || 0;
        console.log(`   ${length}-letter words: ${count} pairs`);
      } catch (error) {
        console.error(`   ⚠ Error getting count for ${length}-letter words: ${error}`);
      }
    }
    
  } catch (error) {
    console.error('Error importing word pairs:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
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

export { importPairsFromFile };

