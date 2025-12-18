// Server-side word loading utility
// Reads words.json directly from the filesystem

import { readFileSync } from 'fs';
import { join } from 'path';
import { loadWordsFromJSON, getTotalWordCount } from './words';

let serverWordsLoaded = false;

/**
 * Load words on the server side (for API routes)
 */
export function loadWordsServer(): void {
  // Check if words are already loaded
  try {
    const count = getTotalWordCount();
    if (count > 0) {
      serverWordsLoaded = true;
      return; // Already loaded
    }
  } catch {
    // Words not loaded yet, continue
  }

  if (serverWordsLoaded) {
    return; // Already attempted to load
  }

  try {
    // Read words.json from public folder
    const publicPath = join(process.cwd(), 'public', 'words.json');
    const fileContents = readFileSync(publicPath, 'utf-8');
    const words = JSON.parse(fileContents);
    
    loadWordsFromJSON(words);
    serverWordsLoaded = true;
    console.log('Word dictionary loaded on server');
  } catch (error) {
    console.error('Failed to load words on server:', error);
    throw new Error(`Failed to load word dictionary on server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

