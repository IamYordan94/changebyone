/**
 * Script to verify words.json format
 * Run with: npx tsx scripts/verifyWordsJson.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const wordsPath = join(process.cwd(), 'public', 'words.json');

try {
  const wordsData = readFileSync(wordsPath, 'utf-8');
  const words = JSON.parse(wordsData);
  
  console.log('\n📚 Words.json Verification\n');
  console.log('='.repeat(60));
  
  // Check if it's an object
  if (typeof words !== 'object' || words === null || Array.isArray(words)) {
    console.error('❌ Invalid format: words.json should be an object with length keys');
    process.exit(1);
  }
  
  // Get all lengths
  const lengths = Object.keys(words)
    .map(Number)
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  console.log('\nWord Lengths Available:');
  console.log('-'.repeat(60));
  
  let allValid = true;
  const requiredLengths = [3, 4, 5, 6, 7, 8];
  
  for (const length of requiredLengths) {
    const count = words[length]?.length || 0;
    const exists = lengths.includes(length);
    const status = exists && count > 0 ? '✅' : '❌';
    
    console.log(`${status} ${length}-letter words: ${count} words`);
    
    if (!exists || count === 0) {
      allValid = false;
    }
  }
  
  // Check for extra lengths
  const extraLengths = lengths.filter(l => !requiredLengths.includes(l));
  if (extraLengths.length > 0) {
    console.log('\nExtra lengths found (not required but OK):');
    extraLengths.forEach(len => {
      const count = words[len]?.length || 0;
      console.log(`   ${len}-letter words: ${count} words`);
    });
  }
  
  // Validate structure
  console.log('\nStructure Validation:');
  console.log('-'.repeat(60));
  
  let structureValid = true;
  for (const length of lengths) {
    const wordList = words[length];
    if (!Array.isArray(wordList)) {
      console.error(`❌ ${length}-letter words should be an array`);
      structureValid = false;
      continue;
    }
    
    // Check if all words are strings
    const nonStringWords = wordList.filter(w => typeof w !== 'string');
    if (nonStringWords.length > 0) {
      console.error(`❌ ${length}-letter words contains non-string values`);
      structureValid = false;
    }
    
    // Check if words match the length (only warn for required lengths)
    const wrongLength = wordList.filter(w => typeof w === 'string' && w.length !== length);
    if (wrongLength.length > 0 && requiredLengths.includes(length)) {
      console.warn(`⚠️  ${length}-letter words contains ${wrongLength.length} words with wrong length`);
    }
    // For extra lengths (like 9-letter words), we don't warn since they're not used by the app
  }
  
  console.log('-'.repeat(60));
  
  if (allValid && structureValid) {
    console.log('\n✅ words.json format is correct!');
    process.exit(0);
  } else {
    console.log('\n⚠️  words.json has some issues');
    process.exit(1);
  }
  
} catch (error) {
  console.error('Error reading words.json:', error);
  if (error instanceof Error) {
    console.error('Message:', error.message);
  }
  process.exit(1);
}

