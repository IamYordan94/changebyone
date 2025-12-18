import { calculateOptimalPath } from './gameLogic';
import { getWordsByLength, isValidWord } from './words';

/**
 * Verify that a word pair has a valid path and is solvable within max moves
 * @param start - Starting word
 * @param end - Target word
 * @param maxMoves - Maximum allowed moves (default 10)
 * @returns Object with isValid flag and optimalSteps count
 */
export function verifyWordPair(
  start: string,
  end: string,
  maxMoves: number = 10
): { isValid: boolean; optimalSteps: number } {
  // Basic validation
  if (!start || !end) {
    return { isValid: false, optimalSteps: -1 };
  }

  const startLower = start.toLowerCase();
  const endLower = end.toLowerCase();

  // Check words are same length
  if (startLower.length !== endLower.length) {
    return { isValid: false, optimalSteps: -1 };
  }

  // Check words are different
  if (startLower === endLower) {
    return { isValid: false, optimalSteps: -1 };
  }

  // Check words are valid
  if (!isValidWord(startLower) || !isValidWord(endLower)) {
    return { isValid: false, optimalSteps: -1 };
  }

  // Get dictionary for this word length
  const wordLength = startLower.length;
  const dictionary = getWordsByLength(wordLength);

  if (dictionary.length === 0) {
    return { isValid: false, optimalSteps: -1 };
  }

  // Calculate optimal path with early exit optimization for longer words
  // For words 6+ letters, limit search depth to maxMoves + 2 for performance
  const maxDepth = wordLength >= 6 ? maxMoves + 2 : undefined;
  const optimalPath = calculateOptimalPath(startLower, endLower, dictionary, maxDepth);

  // If no path exists, invalid
  if (optimalPath.length === 0) {
    return { isValid: false, optimalSteps: -1 };
  }

  // Calculate number of steps (path length - 1)
  const optimalSteps = optimalPath.length - 1;

  // Valid only if optimal steps <= max moves
  return {
    isValid: optimalSteps <= maxMoves,
    optimalSteps,
  };
}

