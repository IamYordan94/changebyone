/**
 * Comprehensive Health Check Script
 * Verifies all dependencies and configuration for the game
 * Run with: npx tsx scripts/healthCheck.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: CheckResult['status'], message: string, details?: string) {
  results.push({ name, status, message, details });
}

// Async function to check database
async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    addResult('Database Connection', 'skip', 'DATABASE_URL not set - skipping database checks');
    return;
  }

  try {
    const dbModule = await import('../lib/db');
    const sql = dbModule.sql;
    
    // Test connection with a simple query
    await sql`SELECT 1 as test`;
    addResult('Database Connection', 'pass', 'Successfully connected to database');
    
    // Check for required tables
    const requiredTables = [
      'daily_challenges',
      'word_pairs',
      'user_solutions',
      'daily_completions',
      'challenges',
      'challenge_participants',
      'daily_schedule'
    ];
    
    for (const table of requiredTables) {
      try {
        const result = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        `;
        const exists = Array.isArray(result) && result.length > 0;
        if (exists) {
          addResult(`Table: ${table}`, 'pass', 'Exists');
        } else {
          addResult(`Table: ${table}`, 'fail', 'Missing - run migrations');
        }
      } catch (error) {
        addResult(`Table: ${table}`, 'warning', 'Cannot check', String(error));
      }
    }
    
    // Check for min_steps column (should NOT exist)
    try {
      const result = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'daily_challenges' AND column_name = 'min_steps'
      `;
      const exists = Array.isArray(result) && result.length > 0;
      if (exists) {
        addResult('Schema: min_steps column', 'fail', 'Column still exists - run migration 007_drop_min_steps.sql');
      } else {
        addResult('Schema: min_steps column', 'pass', 'Column correctly removed');
      }
    } catch (error) {
      addResult('Schema: min_steps column', 'warning', 'Cannot check', String(error));
    }
    
    // Check word pairs count
    const WORD_LENGTHS = [3, 4, 5, 6, 7, 8];
    for (const length of WORD_LENGTHS) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count FROM word_pairs WHERE word_length = ${length}
        `;
        const resultArray = Array.isArray(result) ? result : [];
        const firstRow = resultArray[0] as { count: number | string } | undefined;
        const count = Number(firstRow?.count || 0);
        if (count >= 50) {
          addResult(`Word Pairs (${length}-letter)`, 'pass', `${count} pairs available`);
        } else if (count > 0) {
          addResult(`Word Pairs (${length}-letter)`, 'warning', `Only ${count} pairs (recommend at least 50)`);
        } else {
          addResult(`Word Pairs (${length}-letter)`, 'fail', 'No pairs found - run word pair generation');
        }
      } catch (error) {
        addResult(`Word Pairs (${length}-letter)`, 'skip', 'Cannot check', String(error));
      }
    }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('DATABASE_URL')) {
      addResult('Database Connection', 'fail', 'DATABASE_URL is invalid or missing');
    } else {
      addResult('Database Connection', 'fail', 'Cannot connect to database', errorMsg);
    }
  }
}

// Main execution function
async function main() {
  // 1. Check for .env.local file
  console.log('\n🔍 Running Health Check...\n');
  console.log('='.repeat(70));

  console.log('\n📁 File System Checks:');
  console.log('-'.repeat(70));

  // Check .env.local
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, 'utf-8');
      const hasDatabaseUrl = envContent.includes('DATABASE_URL');
      if (hasDatabaseUrl) {
        // Check if it's not empty
        const match = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
        if (match && match[1].trim() && !match[1].trim().match(/^(undefined|null|)$/)) {
          addResult('.env.local', 'pass', 'File exists with DATABASE_URL');
        } else {
          addResult('.env.local', 'fail', 'File exists but DATABASE_URL is empty or invalid');
        }
      } else {
        addResult('.env.local', 'fail', 'File exists but DATABASE_URL is missing');
      }
    } catch (error) {
      addResult('.env.local', 'fail', 'File exists but cannot be read', String(error));
    }
  } else {
    addResult('.env.local', 'fail', 'File does not exist', 'Create .env.local with DATABASE_URL');
  }

  // Check words.json
  const wordsJsonPath = join(process.cwd(), 'public', 'words.json');
  if (existsSync(wordsJsonPath)) {
    try {
      const wordsContent = readFileSync(wordsJsonPath, 'utf-8');
      const words = JSON.parse(wordsContent);
      
      // Validate structure
      if (typeof words === 'object' && words !== null) {
        const lengths = Object.keys(words).map(Number).filter(n => !isNaN(n) && n >= 3 && n <= 8);
        const totalWords = lengths.reduce((sum, len) => sum + (Array.isArray(words[String(len)]) ? words[String(len)].length : 0), 0);
        
        if (lengths.length > 0 && totalWords > 0) {
          addResult('words.json', 'pass', `Valid file with ${lengths.length} word lengths, ${totalWords.toLocaleString()} total words`);
        } else {
          addResult('words.json', 'warning', 'File exists but has no valid word data');
        }
      } else {
        addResult('words.json', 'fail', 'File exists but has invalid JSON structure');
      }
    } catch (error) {
      addResult('words.json', 'fail', 'File exists but cannot be parsed', String(error));
    }
  } else {
    addResult('words.json', 'fail', 'File does not exist', 'Expected at: public/words.json');
  }

  // Check critical source files
  const criticalFiles = [
    'app/page.tsx',
    'app/layout.tsx',
    'contexts/GameContext.tsx',
    'components/GameBoard.tsx',
    'lib/db.ts',
    'lib/dailyChallenge.ts',
    'lib/gameLogic.ts',
    'lib/words.ts',
    'types/index.ts',
  ];

  console.log('\n📄 Critical Source Files:');
  console.log('-'.repeat(70));

  for (const file of criticalFiles) {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      addResult(`File: ${file}`, 'pass', 'Exists');
    } else {
      addResult(`File: ${file}`, 'fail', 'Missing');
    }
  }

  // Check package.json dependencies
  console.log('\n📦 Dependencies:');
  console.log('-'.repeat(70));

  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const requiredDeps = ['next', 'react', 'react-dom', '@neondatabase/serverless'];
      const requiredDevDeps = ['typescript', '@types/node', '@types/react', '@types/react-dom'];
      
      const missingDeps: string[] = [];
      const missingDevDeps: string[] = [];
      
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep]) {
          missingDeps.push(dep);
        }
      }
      
      for (const dep of requiredDevDeps) {
        if (!packageJson.devDependencies?.[dep]) {
          missingDevDeps.push(dep);
        }
      }
      
      if (missingDeps.length === 0 && missingDevDeps.length === 0) {
        addResult('package.json', 'pass', 'All required dependencies present');
      } else {
        const missing = [...missingDeps, ...missingDevDeps];
        addResult('package.json', 'warning', `Missing dependencies: ${missing.join(', ')}`);
      }
    } else {
      addResult('package.json', 'fail', 'File does not exist');
    }
  } catch (error) {
    addResult('package.json', 'fail', 'Cannot read or parse', String(error));
  }

  // Database checks (if DATABASE_URL is available)
  console.log('\n🗄️  Database Checks:');
  console.log('-'.repeat(70));

  // Load environment variables
  try {
    if (existsSync(envPath)) {
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
    }
  } catch (error) {
    addResult('Database Connection', 'skip', 'Cannot load environment variables', String(error));
  }

  // Run database checks
  await checkDatabase();

  // Print summary
  console.log('\n📊 Summary:');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`⏭️  Skipped: ${skipped}`);

  // Print detailed results
  console.log('\n📋 Detailed Results:');
  console.log('='.repeat(70));

  for (const result of results) {
    const icon = 
      result.status === 'pass' ? '✅' :
      result.status === 'fail' ? '❌' :
      result.status === 'warning' ? '⚠️' : '⏭️';
    
    console.log(`\n${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
  }

  // Final verdict
  console.log('\n' + '='.repeat(70));
  if (failed === 0 && warnings === 0) {
    console.log('\n🎉 All checks passed! Your game should be ready to run.');
    console.log('\nNext steps:');
    console.log('  1. Run: npm install (if dependencies are missing)');
    console.log('  2. Run: npm run dev');
    console.log('  3. Open: http://localhost:3000');
  } else if (failed === 0) {
    console.log('\n✅ Critical checks passed! Some warnings to review.');
    console.log('\nYou can try running the game, but review the warnings above.');
  } else {
    console.log('\n⚠️  Some critical checks failed. Please fix the issues above before running the game.');
    console.log('\nCommon fixes:');
    console.log('  - Create .env.local with DATABASE_URL');
    console.log('  - Ensure public/words.json exists');
    console.log('  - Run database migrations');
    console.log('  - Generate word pairs: npx tsx scripts/generateWordPairs.ts');
  }

  console.log('\n');
}

// Run main if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
