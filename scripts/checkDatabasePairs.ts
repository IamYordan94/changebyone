/**
 * Script to check word pairs count in database
 * Run with: npx tsx scripts/checkDatabasePairs.ts
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
const MIN_REQUIRED = 50;

async function main() {
  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;
    
    console.log('\n📊 Word Pairs Database Status\n');
    console.log('='.repeat(60));
    
    const results: Array<{ length: number; count: number; status: string }> = [];
    
    for (const length of WORD_LENGTHS) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count FROM word_pairs WHERE word_length = ${length}
        `;
        const count = Number(result[0]?.count || 0);
        const status = count >= MIN_REQUIRED ? '✅' : '⚠️';
        results.push({ length, count, status });
      } catch (error) {
        console.error(`Error checking ${length}-letter words:`, error);
        results.push({ length, count: 0, status: '❌' });
      }
    }
    
    // Display results
    console.log('\nCurrent Database Counts:');
    console.log('-'.repeat(60));
    let allComplete = true;
    
    for (const { length, count, status } of results) {
      const meetsRequirement = count >= MIN_REQUIRED;
      if (!meetsRequirement) allComplete = false;
      
      console.log(`${status} ${length}-letter words: ${count} pairs ${meetsRequirement ? '(✓)' : `(need ${MIN_REQUIRED - count} more)`}`);
    }
    
    console.log('-'.repeat(60));
    
    if (allComplete) {
      console.log(`\n✅ All word lengths have at least ${MIN_REQUIRED} pairs!`);
    } else {
      console.log(`\n⚠️  Some word lengths need more pairs (minimum ${MIN_REQUIRED} required)`);
    }
    
    console.log('\n');
    
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

