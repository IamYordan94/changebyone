import { hasOneLetterDifference } from './wordValidator';
import { isValidWord, getWordsByLength } from './words';
import type { Difficulty, ValidationResult } from '@/types';

/**
 * Check if player has won (reached target word)
 */
export function checkWinCondition(currentWord: string, targetWord: string): boolean {
  return currentWord.toLowerCase() === targetWord.toLowerCase();
}

/**
 * Calculate optimal path using BFS (Breadth-First Search)
 * Returns the shortest path from start to end, or empty array if no path exists
 * @param maxDepth - Optional maximum depth to search (for performance optimization)
 */
export function calculateOptimalPath(
  start: string,
  end: string,
  dictionary: string[],
  maxDepth?: number
): string[] {
  if (start.toLowerCase() === end.toLowerCase()) {
    return [start];
  }
  
  const startLower = start.toLowerCase();
  const endLower = end.toLowerCase();
  
  // BFS to find shortest path
  const queue: { word: string; path: string[] }[] = [{ word: startLower, path: [startLower] }];
  const visited = new Set<string>([startLower]);
  
  while (queue.length > 0) {
    const { word, path } = queue.shift()!;
    
    // Early exit if path is getting too long (optimization for longer words)
    if (maxDepth && path.length > maxDepth) {
      continue; // Skip paths that are already too long
    }
    
    // Check all words that differ by one letter
    for (const nextWord of dictionary) {
      const nextLower = nextWord.toLowerCase();
      
      if (!visited.has(nextLower) && hasOneLetterDifference(word, nextLower)) {
        const newPath = [...path, nextLower];
        
        if (nextLower === endLower) {
          return newPath;
        }
        
        visited.add(nextLower);
        queue.push({ word: nextLower, path: newPath });
      }
    }
  }
  
  return []; // No path found
}

/**
 * Find optimal path length (number of steps)
 * @param maxDepth - Optional maximum depth to search (for performance optimization)
 */
export function findOptimalPathLength(
  start: string,
  end: string,
  dictionary: string[],
  maxDepth?: number
): number {
  const path = calculateOptimalPath(start, end, dictionary, maxDepth);
  return path.length > 0 ? path.length - 1 : -1; // -1 means no path exists
}

/**
 * Calculate difficulty based on optimal path length
 */
export function calculateDifficulty(
  start: string,
  end: string,
  dictionary: string[]
): Difficulty {
  const optimalLength = findOptimalPathLength(start, end, dictionary);
  
  if (optimalLength === -1) {
    return 'hard'; // Default to hard if no path found
  }
  
  if (optimalLength <= 4) {
    return 'easy';
  } else if (optimalLength <= 6) {
    return 'medium';
  } else {
    return 'hard';
  }
}

/**
 * Calculate letter similarity between two words (0-1)
 */
export function calculateLetterSimilarity(word1: string, word2: string): number {
  if (word1.length !== word2.length) {
    return 0;
  }
  
  let matches = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
      matches++;
    }
  }
  
  return matches / word1.length;
}

/**
 * Get hint - suggests how many letters match
 */
export function getHint(currentWord: string, targetWord: string): string {
  const similarity = calculateLetterSimilarity(currentWord, targetWord);
  const matches = Math.floor(similarity * currentWord.length);
  
  if (matches === currentWord.length) {
    return 'You\'ve reached the target word!';
  }
  
  return `${matches} out of ${currentWord.length} letters match the target.`;
}

/**
 * Suggest valid next words (for hints)
 * Returns words that are one letter different and closer to target
 */
export function suggestNextWord(
  currentWord: string,
  targetWord: string,
  dictionary: string[]
): string[] {
  const currentLower = currentWord.toLowerCase();
  const targetLower = targetWord.toLowerCase();
  const currentSimilarity = calculateLetterSimilarity(currentLower, targetLower);
  
  const suggestions: { word: string; similarity: number }[] = [];
  
  for (const word of dictionary) {
    const wordLower = word.toLowerCase();
    
    if (
      hasOneLetterDifference(currentLower, wordLower) &&
      wordLower !== currentLower
    ) {
      const similarity = calculateLetterSimilarity(wordLower, targetLower);
      
      // Prefer words that are closer to target
      if (similarity > currentSimilarity) {
        suggestions.push({ word: wordLower, similarity });
      }
    }
  }
  
  // Sort by similarity (highest first) and return top 3
  return suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(s => s.word);
}

/**
 * Validate entire word chain
 */
export function validateWordChain(
  chain: string[],
  dictionary: string[]
): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (chain.length < 2) {
    return [{ isValid: false, error: 'Chain must have at least 2 words.' }];
  }
  
  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const curr = chain[i];
    
    if (!isValidWord(curr)) {
      results.push({
        isValid: false,
        error: `"${curr}" is not a valid word.`,
      });
      continue;
    }
    
    if (!hasOneLetterDifference(prev, curr)) {
      results.push({
        isValid: false,
        error: `"${prev}" and "${curr}" differ by more than one letter.`,
      });
      continue;
    }
    
    results.push({ isValid: true });
  }
  
  return results;
}

