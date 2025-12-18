// Utility to load words from JSON file
// This file will be used to initialize the word dictionary
// Call this function on app startup or when needed

import { loadWordsFromJSON } from './words';

/**
 * Load words from a JSON file
 * Place your word JSON file in the public folder or import it directly
 * 
 * Example usage:
 * - If words are in public/words.json:
 *   const response = await fetch('/words.json');
 *   const words = await response.json();
 *   loadWordsFromJSON(words);
 * 
 * - If words are imported directly:
 *   import words from '@/data/words.json';
 *   loadWordsFromJSON(words);
 */
export async function initializeWordDictionary(): Promise<void> {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Use full URL for client-side fetch
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/words.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch words.json: ${response.status} ${response.statusText}`);
    }
    
    const words = await response.json();
    
    // Validate structure
    if (typeof words !== 'object' || words === null) {
      throw new Error('Invalid words.json format: expected an object');
    }
    
    loadWordsFromJSON(words);
    console.log('Word dictionary loaded successfully');
  } catch (error) {
    console.error('Failed to load word dictionary:', error);
    throw new Error(`Word dictionary not found or invalid. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

