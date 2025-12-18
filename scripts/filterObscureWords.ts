/**
 * Filter out obscure words from word pairs JSON
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// List of obscure/rare words to filter out
const OBSCURE_WORDS = new Set([
  // From the file
  'whoof', 'alada', 'bundy', 'podgy', 'kiack', 'broma', 'liege', 'lasty', 
  'dicot', 'macaw', 'quipu', 'parky', 'posca', 'stive', 'treen', 'flype', 
  'repic', 'weepy', 'sadhe', 'tanga', 'unput', 'urite', 'darat', 'solea', 
  'hanna', 'rummy', 'tripy', 'reedy', 'puler', 'santo', 'grano', 'fonly', 
  'withy', 'poche', 'guama', 'musci', 'aniba', 'reamy', 'plier', 'moise', 
  'shaka', 'barmy', 'subah', 'wanga', 'sopor', 'cohen', 'nonyl', 'parly', 
  'bungy', 'waspy', 'lieve', 'chaga', 'utick', 'pandy', 'amani', 'slote', 
  'bagre', 'farer', 'zoism', 'spuke', 'moule', 'rayed', 'senna', 'tapir', 
  'ferio', 'taxor', 'busky', 'afric', 'malic', 'foute', 'patao', 'biabo', 
  'gowan', 'orias', 'scrog', 'kevyn', 'caber', 'danda', 'reuel', 'feere', 
  'rasse', 'cabob', 'sneap', 'shrap', 'twana', 'angor', 'atune', 'humbo', 
  'apina', 'wende', 'roque', 'chuje', 'eaved', 'wheen', 'pinky', 'hough', 
  'ineri', 'churl', 'serer', 'frump', 'aline', 'emend', 'sunna', 'wodge', 
  'toran', 'codol', 'artar', 'drona', 'skart', 'chiot', 'chola', 'groot', 
  'prana', 'crore', 'scran', 'cline', 'firer', 'teest', 'coude', 'rutch', 
  'agamy', 'navew', 'pasan', 'bhang', 'galey', 'breme', 'melia', 'gusla', 
  'atony', 'nenta', 'wined', 'biter', 'props', 'glare', 'clerk', 'latex', 
  'spare', 'witch', 'cubic', 'route', 'grind', 'clare', 'snarl', 'hence', 
  'plume', 'bossy', 'unbar', 'squat', 'berry', 'badly', 'bravo', 'repay', 
  'earth', 'carat', 'theme', 'chick', 'leaky', 'seven', 'bland', 'horse', 
  'stink', 'hello'
]);

// Words to keep even if they might seem obscure (common enough)
const KEEP_WORDS = new Set([
  'ember', 'vixen', 'tense', 'delay', 'rider', 'atone', 'snork', 'sting', 
  'glean', 'bleed', 'crust', 'breed', 'ingot', 'whine', 'mount', 'shawl', 
  'lined', 'scots', 'etude', 'skirt', 'cough', 'nieve', 'faded', 'halve', 
  'tiler', 'abort', 'brute', 'flake', 'cello'
]);

function isObscure(word: string): boolean {
  const wordLower = word.toLowerCase();
  
  // Keep words in the keep list
  if (KEEP_WORDS.has(wordLower)) {
    return false;
  }
  
  // Check if word is in obscure list
  return OBSCURE_WORDS.has(wordLower);
}

function filterWordPairs(inputPath: string, outputPath: string) {
  console.log(`Reading file: ${inputPath}`);
  const fileContent = readFileSync(inputPath, 'utf-8');
  const pairs = JSON.parse(fileContent);
  
  console.log(`Original pairs: ${pairs.length}`);
  
  const filtered = pairs.filter((pair: any) => {
    const startObscure = isObscure(pair.start_word);
    const endObscure = isObscure(pair.end_word);
    
    // Remove if either word is obscure
    if (startObscure || endObscure) {
      if (startObscure) {
        console.log(`  Removing: ${pair.start_word} -> ${pair.end_word} (obscure start: ${pair.start_word})`);
      } else {
        console.log(`  Removing: ${pair.start_word} -> ${pair.end_word} (obscure end: ${pair.end_word})`);
      }
      return false;
    }
    
    return true;
  });
  
  console.log(`\nFiltered pairs: ${filtered.length}`);
  console.log(`Removed: ${pairs.length - filtered.length} pairs`);
  
  // Write filtered file
  writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
  console.log(`\nSaved cleaned file to: ${outputPath}`);
  
  return filtered;
}

// Run if called directly
if (require.main === module) {
  const inputPath = join(process.cwd(), '..', 'Downloads', 'word_pairs_5 (3).json');
  const outputPath = join(process.cwd(), '..', 'Downloads', 'word_pairs_5_cleaned.json');
  
  filterWordPairs(inputPath, outputPath);
}

export { filterWordPairs, isObscure };

