'use client';

import { useGame as useGameContext } from '@/contexts/GameContext';

/**
 * Custom hook that wraps the game context
 * Provides additional game-specific utilities
 */
export function useGame() {
  const context = useGameContext();

  // Get active puzzle state if available
  const activePuzzle = context.dailyGameState?.puzzles.find(
    p => p.length === context.activePuzzleLength
  );

  const canSubmit = activePuzzle?.status === 'playing';
  const isWon = activePuzzle?.status === 'won';
  const isLost = activePuzzle?.status === 'lost';
  const isGameOver = isWon || isLost;

  return {
    ...context,
    activePuzzle,
    canSubmit,
    isWon,
    isLost,
    isGameOver,
  };
}

