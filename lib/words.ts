// Word dictionary utilities
// This will load words from a JSON file

let wordDictionary: Map<number, string[]> = new Map();
let wordsLoaded = false;

export interface WordDictionary {
  [key: string]: string[]; // e.g., { "3": ["cat", "dog", ...], "4": ["cold", "warm", ...] }
}

/**
 * Load words from JSON file
 * Handles multiple formats:
 * - Array format: ["cat", "dog", ...]
 * - Object by length: { "3": ["cat", ...], "4": ["cold", ...] }
 */
export function loadWordsFromJSON(data: string[] | WordDictionary): void {
  wordDictionary.clear();
  
  if (Array.isArray(data)) {
    // Array format - group by length
    const grouped: { [key: number]: string[] } = {};
    data.forEach(word => {
      const length = word.length;
      if (length >= 2 && length <= 8) {
        if (!grouped[length]) {
          grouped[length] = [];
        }
        grouped[length].push(word.toLowerCase());
      }
    });
    
    Object.entries(grouped).forEach(([length, words]) => {
      wordDictionary.set(Number(length), words);
    });
  } else {
    // Object format by length
    Object.entries(data).forEach(([length, words]) => {
      const len = Number(length);
      if (len >= 2 && len <= 8 && Array.isArray(words)) {
        wordDictionary.set(len, words.map(w => w.toLowerCase()));
      }
    });
  }
  
  wordsLoaded = true;
}

/**
 * Get all words of a specific length
 */
export function getWordsByLength(length: number): string[] {
  if (!wordsLoaded) {
    throw new Error('Words not loaded. Call loadWordsFromJSON first.');
  }
  return wordDictionary.get(length) || [];
}

/**
 * Check if a word exists in the dictionary
 */
export function isValidWord(word: string): boolean {
  if (!wordsLoaded) {
    throw new Error('Words not loaded. Call loadWordsFromJSON first.');
  }
  
  const length = word.length;
  if (length < 2 || length > 8) {
    return false;
  }
  
  const words = wordDictionary.get(length);
  if (!words) {
    return false;
  }
  
  return words.includes(word.toLowerCase());
}

/**
 * Get all available word lengths
 */
export function getAvailableLengths(): number[] {
  return Array.from(wordDictionary.keys()).sort();
}

/**
 * Get total word count
 */
export function getTotalWordCount(): number {
  let total = 0;
  wordDictionary.forEach(words => {
    total += words.length;
  });
  return total;
}

