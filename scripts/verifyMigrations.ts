/**
 * Script to verify database migrations have been applied
 * Run with: npx tsx scripts/verifyMigrations.ts
 * 
 * This script checks if the database schema matches the expected state
 * after all migrations have been applied.
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
  process.exit(1);
}

// Dynamically import db after env vars are loaded
let sql: any;

interface SchemaCheck {
  table: string;
  column?: string;
  shouldExist: boolean;
  description: string;
}

const SCHEMA_CHECKS: SchemaCheck[] = [
  {
    table: 'daily_challenges',
    column: 'min_steps',
    shouldExist: false,
    description: 'min_steps column should be dropped (migration 007)'
  },
  {
    table: 'daily_challenges',
    column: 'optimal_steps',
    shouldExist: true,
    description: 'optimal_steps column should exist (migration 002)'
  },
  {
    table: 'daily_challenges',
    column: 'word_length',
    shouldExist: true,
    description: 'word_length column should exist (migration 002)'
  },
  {
    table: 'daily_challenges',
    column: 'max_moves',
    shouldExist: true,
    description: 'max_moves column should exist (migration 002)'
  },
  {
    table: 'word_pairs',
    shouldExist: true,
    description: 'word_pairs table should exist (migration 003)'
  },
  {
    table: 'challenges',
    shouldExist: true,
    description: 'challenges table should exist (migration 006)'
  },
  {
    table: 'daily_schedule',
    shouldExist: true,
    description: 'daily_schedule table should exist (migration 008)'
  }
];

async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${table} AND column_name = ${column}
    `;
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error(`Error checking column ${table}.${column}:`, error);
    return false;
  }
}

async function checkTableExists(table: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = ${table}
    `;
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error(`Error checking table ${table}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Dynamically import db after env vars are loaded
    const dbModule = await import('../lib/db');
    sql = dbModule.sql;
    
    console.log('\n🔍 Database Migration Verification\n');
    console.log('='.repeat(60));
    
    const results: Array<{ check: SchemaCheck; passed: boolean }> = [];
    
    for (const check of SCHEMA_CHECKS) {
      let exists: boolean;
      
      if (check.column) {
        exists = await checkColumnExists(check.table, check.column);
      } else {
        exists = await checkTableExists(check.table);
      }
      
      const passed = exists === check.shouldExist;
      results.push({ check, passed });
    }
    
    // Display results
    console.log('\nMigration Status:');
    console.log('-'.repeat(60));
    
    let allPassed = true;
    for (const { check, passed } of results) {
      const status = passed ? '✅' : '❌';
      const item = check.column 
        ? `${check.table}.${check.column}` 
        : `table ${check.table}`;
      
      console.log(`${status} ${item}: ${check.description}`);
      if (!passed) {
        allPassed = false;
        const expected = check.shouldExist ? 'exists' : 'does not exist';
        const actual = check.shouldExist ? 'does not exist' : 'exists';
        console.log(`   Expected: ${expected}, Actual: ${actual}`);
      }
    }
    
    console.log('-'.repeat(60));
    
    if (allPassed) {
      console.log('\n✅ All migrations have been applied correctly!');
    } else {
      console.log('\n⚠️  Some migrations may not have been applied.');
      console.log('   Please run the missing migrations in order:');
      console.log('   001_create_tables.sql');
      console.log('   002_add_word_length_to_challenges.sql');
      console.log('   003_create_word_pairs_table.sql');
      console.log('   004_update_max_moves.sql');
      console.log('   005_add_timer_tracking.sql');
      console.log('   006_create_challenge_system.sql');
      console.log('   007_drop_min_steps.sql');
      console.log('   008_create_daily_schedule.sql');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      if (error.message.includes('DATABASE_URL')) {
        console.error('\nPlease ensure DATABASE_URL is set in .env.local');
      }
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

