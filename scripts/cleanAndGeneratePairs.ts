/**
 * Script to clean words and generate verified word pairs for 6-8 letter words
 * Run with: npx tsx scripts/cleanAndGeneratePairs.ts
 * 
 * This script:
 * 1. Loads words from words_6_to_8_clean.json
 * 2. Filters out inappropriate words
 * 3. Generates verified word pairs (2-10 steps, max 10 moves)
 * 4. Saves results to JSON files
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadWordsFromJSON, getWordsByLength } from '../lib/words';
import { verifyWordPair } from '../lib/wordPairVerifier';

// Configuration
const TARGET_PAIRS_PER_LENGTH = 100;
const MIN_STEPS = 2;
const MAX_STEPS = 10;
const MAX_START_WORD_USES = 3;
const WORD_LENGTHS = [6, 7, 8];

// Maximum attempts per word length
const getMaxAttemptsForLength = (length: number): number => {
  if (length === 6) return 50000;
  if (length === 7) return 75000;
  if (length === 8) return 100000;
  return 50000;
};

// Inappropriate words blacklist (must be excluded)
const INAPPROPRIATE_WORDS = new Set([
  'niggly', 'incest', 'thongy', 'pussy', 'raper', 'labia',
  // Add more inappropriate words as needed
]);

/**
 * Filter inappropriate words from a word list
 */
function filterInappropriateWords(words: string[]): string[] {
  return words.filter(word => {
    const wordLower = word.toLowerCase();
    return !INAPPROPRIATE_WORDS.has(wordLower);
  });
}

/**
 * Generate word pairs for a specific word length
 */
async function generatePairsForLength(
  wordLength: number,
  targetCount: number
): Promise<Array<{ start_word: string; end_word: string; optimal_steps: number }>> {
  console.log(`\n🎯 Generating pairs for ${wordLength}-letter words...`);
  console.log(`   Target: ${targetCount} pairs`);
  console.log(`   Max attempts: ${getMaxAttemptsForLength(wordLength)}`);
  
  const words = getWordsByLength(wordLength);
  
  if (words.length === 0) {
    console.error(`   ❌ No words available for length ${wordLength}`);
    return [];
  }
  
  console.log(`   Available words: ${words.length}`);
  
  const pairs: Array<{ start_word: string; end_word: string; optimal_steps: number }> = [];
  const seenPairs = new Set<string>();
  const startWordUsage = new Map<string, number>();
  let attempts = 0;
  let validPairsFound = 0;
  let invalidPairsFound = 0;
  const maxAttempts = getMaxAttemptsForLength(wordLength);
  const startTime = Date.now();
  let lastProgressTime = startTime;
  
  // Shuffle words array for random selection
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);
  
  while (pairs.length < targetCount && attempts < maxAttempts) {
    attempts++;
    
    // Progress logging
    const now = Date.now();
    if (attempts % 1000 === 0 || (now - lastProgressTime) > 30000) {
      const elapsed = ((now - startTime) / 1000).toFixed(1);
      console.log(`   [${wordLength}-letter] Progress: ${attempts} attempts, ${pairs.length} generated, ${validPairsFound} valid, ${invalidPairsFound} invalid (${elapsed}s elapsed)`);
      lastProgressTime = now;
    }
    
    // Random selection
    const startIdx = Math.floor(Math.random() * shuffledWords.length);
    const endIdx = Math.floor(Math.random() * shuffledWords.length);
    
    const startWord = shuffledWords[startIdx];
    const endWord = shuffledWords[endIdx];
    
    // Skip if same word
    if (startWord === endWord) {
      continue;
    }
    
    // Check start word usage (variety requirement)
    const startWordLower = startWord.toLowerCase();
    const currentUsage = startWordUsage.get(startWordLower) || 0;
    if (currentUsage >= MAX_START_WORD_USES) {
      continue; // Skip if start word already used too many times
    }
    
    // Check if pair already seen
    const pairKey1 = `${startWord}-${endWord}`;
    const pairKey2 = `${endWord}-${startWord}`;
    if (seenPairs.has(pairKey1) || seenPairs.has(pairKey2)) {
      continue;
    }
    
    // Verify the pair
    const verification = verifyWordPair(startWord, endWord, MAX_STEPS);
    
    if (verification.isValid && verification.optimalSteps >= MIN_STEPS && verification.optimalSteps <= MAX_STEPS) {
      validPairsFound++;
      
      // Add to pairs
      pairs.push({
        start_word: startWord.toLowerCase(),
        end_word: endWord.toLowerCase(),
        optimal_steps: verification.optimalSteps,
      });
      
      seenPairs.add(pairKey1);
      startWordUsage.set(startWordLower, currentUsage + 1);
      
      if (pairs.length % 10 === 0) {
        console.log(`   ✓ Generated ${pairs.length}/${targetCount} pairs...`);
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
  console.log(`    Successfully generated: ${pairs.length}`);
  console.log(`    Target: ${targetCount}`);
  console.log(`  ${'─'.repeat(50)}\n`);
  
  return pairs;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting word cleaning and pair generation...\n');
  
  try {
    // Load words from words_6_to_8_clean.json
    console.log('Loading words from words_6_to_8_clean.json...');
    const wordsPath = join(process.cwd(), 'public', 'words_6_to_8_clean.json');
    const fileContents = readFileSync(wordsPath, 'utf-8');
    const wordsData = JSON.parse(fileContents);
    
    console.log('Words loaded successfully');
    
    // Filter inappropriate words
    console.log('\n🔍 Filtering inappropriate words...');
    const cleanedWords: Record<string, string[]> = {};
    let totalRemoved = 0;
    
    for (const length of WORD_LENGTHS) {
      const lengthKey = length.toString();
      const words = wordsData[lengthKey] || [];
      const cleaned = filterInappropriateWords(words);
      const removed = words.length - cleaned.length;
      totalRemoved += removed;
      
      cleanedWords[lengthKey] = cleaned;
      console.log(`   ${length}-letter: ${words.length} → ${cleaned.length} words (removed ${removed})`);
    }
    
    console.log(`\n   Total inappropriate words removed: ${totalRemoved}`);
    
    // Load cleaned words into the word dictionary
    loadWordsFromJSON(cleanedWords);
    console.log('Cleaned words loaded into dictionary\n');
    
    // Generate pairs for each length
    const allPairs: Record<number, Array<{ start_word: string; end_word: string; optimal_steps: number }>> = {};
    
    for (const length of WORD_LENGTHS) {
      const pairs = await generatePairsForLength(length, TARGET_PAIRS_PER_LENGTH);
      allPairs[length] = pairs;
      
      // Save to JSON file
      const outputPath = join(process.cwd(), `word_pairs_${length}.json`);
      writeFileSync(outputPath, JSON.stringify(pairs, null, 2));
      console.log(`✅ Saved ${pairs.length} pairs to word_pairs_${length}.json`);
    }
    
    // Summary
    console.log(`\n✅ Generation complete!`);
    console.log(`\n📊 Final summary:`);
    for (const length of WORD_LENGTHS) {
      const count = allPairs[length].length;
      const status = count >= TARGET_PAIRS_PER_LENGTH ? '✓' : '○';
      console.log(`  ${status} ${length}-letter words: ${count}/${TARGET_PAIRS_PER_LENGTH} pairs`);
    }
    
    console.log(`\n📁 Output files:`);
    for (const length of WORD_LENGTHS) {
      console.log(`   - word_pairs_${length}.json`);
    }
    
    console.log(`\n💡 Next step: Run 'npx tsx scripts/importPairsToDatabase.ts' to import into database`);
    
  } catch (error) {
    console.error('Error:', error);
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

export { generatePairsForLength, filterInappropriateWords };
