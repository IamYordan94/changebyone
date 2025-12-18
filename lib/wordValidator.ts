import { isValidWord } from './words';
import type { ValidationResult } from '@/types';

/**
 * Check if two words differ by exactly one letter
 */
export function hasOneLetterDifference(word1: string, word2: string): boolean {
  if (word1.length !== word2.length) {
    return false;
  }
  
  let differences = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i].toLowerCase() !== word2[i].toLowerCase()) {
      differences++;
      if (differences > 1) {
        return false;
      }
    }
  }
  
  return differences === 1;
}

/**
 * Validate a word for the game
 * Checks: exists in dictionary, one letter difference, not already used
 */
export function validateWord(
  word: string,
  previousWord: string,
  dictionary: string[],
  usedWords: string[] = []
): ValidationResult {
  // Check if word is in dictionary
  if (!isValidWord(word)) {
    return {
      isValid: false,
      error: 'Not a valid word. Try again.',
    };
  }
  
  // Check if word has correct length
  if (word.length !== previousWord.length) {
    return {
      isValid: false,
      error: 'Word must be the same length.',
    };
  }
  
  // Check if exactly one letter differs
  if (!hasOneLetterDifference(previousWord, word)) {
    return {
      isValid: false,
      error: 'Must change exactly one letter.',
    };
  }
  
  // Check if word already used in chain
  if (usedWords.includes(word.toLowerCase())) {
    return {
      isValid: false,
      error: 'Word already used in this chain.',
    };
  }
  
  return {
    isValid: true,
  };
}

