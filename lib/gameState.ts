import type { GameState, Difficulty, Puzzle, PuzzleGameState, DailyGameState } from '@/types';
import { validateWord } from './wordValidator';
import { checkWinCondition } from './gameLogic';
import { getWordsByLength } from './words';

/**
 * Initialize a new game state
 */
export function initializeGame(
  startWord: string,
  endWord: string,
  difficulty: Difficulty,
  dailyChallengeDate: string,
  maxMoves: number = 10
): GameState {
  return {
    currentWord: startWord.toLowerCase(),
    targetWord: endWord.toLowerCase(),
    wordChain: [startWord.toLowerCase()],
    moves: 0,
    maxMoves,
    status: 'playing',
    difficulty,
    dailyChallengeDate,
    errors: [],
  };
}

/**
 * Submit a word and update game state
 */
export function submitWord(
  state: GameState,
  word: string,
  dictionary: string[]
): GameState {
  // If game is already won or lost, don't process
  if (state.status !== 'playing') {
    return state;
  }

  // Validate the word
  const validation = validateWord(
    word,
    state.currentWord,
    dictionary,
    state.wordChain
  );

  if (!validation.isValid) {
    return {
      ...state,
      errors: [...state.errors, validation.error || 'Invalid word'],
    };
  }

  const wordLower = word.toLowerCase();
  const newChain = [...state.wordChain, wordLower];
  const newMoves = state.moves + 1;

  // Check win condition
  const won = checkWinCondition(wordLower, state.targetWord);

  // Check lose condition (out of moves)
  const lost = !won && newMoves >= state.maxMoves;

  return {
    ...state,
    currentWord: wordLower,
    wordChain: newChain,
    moves: newMoves,
    status: won ? 'won' : lost ? 'lost' : 'playing',
    errors: [], // Clear errors on successful move
  };
}

/**
 * Reset game to initial state
 */
export function resetGame(state: GameState): GameState {
  return {
    ...state,
    currentWord: state.wordChain[0],
    wordChain: [state.wordChain[0]],
    moves: 0,
    status: 'playing',
    errors: [],
  };
}

/**
 * Load game state from localStorage
 */
export function loadGameStateFromStorage(
  dailyChallengeDate: string
): GameState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(`wordLadder_${dailyChallengeDate}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only load if it's for today's challenge
      if (parsed.dailyChallengeDate === dailyChallengeDate) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }

  return null;
}

/**
 * Save game state to localStorage
 */
export function saveGameStateToStorage(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      `wordLadder_${state.dailyChallengeDate}`,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

/**
 * Clear game state from localStorage
 */
export function clearGameStateFromStorage(dailyChallengeDate: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(`wordLadder_${dailyChallengeDate}`);
}

// ============================================================================
// New functions for multi-puzzle daily challenges
// ============================================================================

/**
 * Initialize a puzzle game state
 */
export function initializePuzzleState(puzzle: Puzzle): PuzzleGameState {
  return {
    length: puzzle.length,
    start_word: puzzle.start_word.toLowerCase(),
    end_word: puzzle.end_word.toLowerCase(),
    currentWord: puzzle.start_word.toLowerCase(),
    wordChain: [puzzle.start_word.toLowerCase()],
    moves: 0,
    maxMoves: puzzle.max_moves,
    status: 'not_started',
    errors: [],
  };
}

/**
 * Initialize daily game state with all puzzles
 */
export function initializeDailyGameState(
  date: string,
  puzzles: Puzzle[]
): DailyGameState {
  const puzzleStates = puzzles.map(puzzle => initializePuzzleState(puzzle));

  return {
    date,
    puzzles: puzzleStates,
    overallProgress: 0,
  };
}

/**
 * Submit a word to a specific puzzle
 */
export function submitWordToPuzzle(
  state: DailyGameState,
  puzzleLength: number,
  word: string
): DailyGameState {
  // Find the puzzle
  const puzzleIndex = state.puzzles.findIndex(p => p.length === puzzleLength);

  if (puzzleIndex === -1) {
    return state;
  }

  const puzzleState = state.puzzles[puzzleIndex];

  // If puzzle is already won or lost, don't process
  if (puzzleState.status === 'won' || puzzleState.status === 'lost') {
    return state;
  }

  // Get dictionary for this word length
  const dictionary = getWordsByLength(puzzleLength);

  // Validate the word
  const validation = validateWord(
    word,
    puzzleState.currentWord,
    dictionary,
    puzzleState.wordChain
  );

  // Create updated puzzle state
  const updatedPuzzles = [...state.puzzles];

  if (!validation.isValid) {
    const wasNotStarted = puzzleState.status === 'not_started';
    updatedPuzzles[puzzleIndex] = {
      ...puzzleState,
      errors: [...puzzleState.errors, validation.error || 'Invalid word'],
      status: wasNotStarted ? 'playing' : puzzleState.status,
    };
  } else {
    const wordLower = word.toLowerCase();
    const newChain = [...puzzleState.wordChain, wordLower];
    const newMoves = puzzleState.moves + 1;

    // Check win condition
    const won = checkWinCondition(wordLower, puzzleState.end_word);

    // Check lose condition (out of moves)
    const lost = !won && newMoves >= puzzleState.maxMoves;

    updatedPuzzles[puzzleIndex] = {
      ...puzzleState,
      currentWord: wordLower,
      wordChain: newChain,
      moves: newMoves,
      status: won ? 'won' : lost ? 'lost' : 'playing',
      errors: [], // Clear errors on successful move
    };
  }

  // Calculate overall progress
  const completedPuzzles = updatedPuzzles.filter(p => p.status === 'won').length;
  const overallProgress = completedPuzzles / updatedPuzzles.length;

  return {
    ...state,
    puzzles: updatedPuzzles,
    overallProgress,
  };
}

/**
 * Reset a specific puzzle to initial state
 */
export function resetPuzzle(
  state: DailyGameState,
  puzzleLength: number,
  preserveTimer: boolean = false
): DailyGameState {
  const puzzleIndex = state.puzzles.findIndex(p => p.length === puzzleLength);

  if (puzzleIndex === -1) {
    return state;
  }

  const puzzleState = state.puzzles[puzzleIndex];
  const updatedPuzzles = [...state.puzzles];

  updatedPuzzles[puzzleIndex] = {
    ...puzzleState,
    currentWord: puzzleState.start_word,
    wordChain: [puzzleState.start_word],
    moves: 0,
    status: 'not_started',
    errors: [],
  };

  // Recalculate progress
  const completedPuzzles = updatedPuzzles.filter(p => p.status === 'won').length;
  const overallProgress = completedPuzzles / updatedPuzzles.length;

  return {
    ...state,
    puzzles: updatedPuzzles,
    overallProgress,
  };
}

/**
 * Load daily game state from localStorage
 */
export function loadDailyGameStateFromStorage(
  date: string
): DailyGameState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(`dailyGameState_${date}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only load if it's for the correct date
      if (parsed.date === date) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading daily game state:', error);
  }

  return null;
}

/**
 * Save daily game state to localStorage
 */
export function saveDailyGameStateToStorage(state: DailyGameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      `dailyGameState_${state.date}`,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error('Error saving daily game state:', error);
  }
}

/**
 * Clear daily game state from localStorage
 */
export function clearDailyGameStateFromStorage(date: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(`dailyGameState_${date}`);
}

