'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DailyChallenge, DailyGameState } from '@/types';
import {
  initializeDailyGameState,
  submitWordToPuzzle,
  resetPuzzle,
  loadDailyGameStateFromStorage,
  saveDailyGameStateToStorage,
} from '@/lib/gameState';
import { getTotalWordCount } from '@/lib/words';

interface GameContextType {
  dailyGameState: DailyGameState | null;
  dailyChallenge: DailyChallenge | null;
  isLoading: boolean;
  error: string | null;
  submitWord: (puzzleLength: number, word: string) => void;
  resetPuzzle: (puzzleLength: number) => void;
  loadDailyChallenge: () => Promise<void>;
  activePuzzleLength: number | null;
  setActivePuzzleLength: (length: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [dailyGameState, setDailyGameState] = useState<DailyGameState | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePuzzleLength, setActivePuzzleLength] = useState<number | null>(null);

  const loadDailyChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Wait for words to be loaded
      let wordsReady = false;
      let attempts = 0;
      while (!wordsReady && attempts < 50) {
        try {
          const count = getTotalWordCount();
          if (count > 0) {
            wordsReady = true;
          } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        } catch {
          // Words not loaded yet
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      if (!wordsReady) {
        throw new Error('Word dictionary not loaded. Please refresh the page.');
      }
      
      // Fetch today's challenge from API
      const response = await fetch('/api/challenges');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load daily challenge');
      }
      
      const challenge: DailyChallenge = await response.json();
      
      // Check if response contains an error
      if ((challenge as any).error) {
        throw new Error((challenge as any).error);
      }
      setDailyChallenge(challenge);
      
      // Try to load saved game state
      const savedState = loadDailyGameStateFromStorage(challenge.date);
      
      if (savedState && savedState.date === challenge.date) {
        // Ensure all puzzles are present
        if (savedState.puzzles.length === challenge.puzzles.length) {
          setDailyGameState(savedState);
          // Set active puzzle to first incomplete one, or first puzzle
          const incompletePuzzle = savedState.puzzles.find(p => p.status !== 'won');
          setActivePuzzleLength(incompletePuzzle?.length || challenge.puzzles[0].length);
        } else {
          // Puzzles don't match, reinitialize
          const newState = initializeDailyGameState(challenge.date, challenge.puzzles);
          setDailyGameState(newState);
          setActivePuzzleLength(challenge.puzzles[0].length);
          saveDailyGameStateToStorage(newState);
        }
      } else {
        // Initialize new game state
        const newState = initializeDailyGameState(challenge.date, challenge.puzzles);
        setDailyGameState(newState);
        setActivePuzzleLength(challenge.puzzles[0].length);
        saveDailyGameStateToStorage(newState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading daily challenge:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitWord = useCallback(async (puzzleLength: number, word: string) => {
    if (!dailyGameState) {
      return;
    }

    const puzzleState = dailyGameState.puzzles.find(p => p.length === puzzleLength);
    if (!puzzleState || (puzzleState.status !== 'playing' && puzzleState.status !== 'not_started')) {
      return;
    }
    
    const newState = submitWordToPuzzle(dailyGameState, puzzleLength, word);
    setDailyGameState(newState);
    saveDailyGameStateToStorage(newState);

    // Submit solution with timer data if puzzle is won
    const updatedPuzzle = newState.puzzles.find(p => p.length === puzzleLength);
    if (updatedPuzzle?.status === 'won' && updatedPuzzle.completionTimeMs && dailyChallenge) {
      try {
        const puzzleStartTime = updatedPuzzle.timerStartTime 
          ? new Date(updatedPuzzle.timerStartTime).toISOString()
          : undefined;
        const puzzleEndTime = updatedPuzzle.timerStartTime && updatedPuzzle.completionTimeMs
          ? new Date(updatedPuzzle.timerStartTime + updatedPuzzle.completionTimeMs).toISOString()
          : undefined;

        await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_date: dailyChallenge.date,
            word_length: puzzleLength,
            solution_path: updatedPuzzle.wordChain,
            steps: updatedPuzzle.moves,
            completion_time_ms: updatedPuzzle.completionTimeMs,
            puzzle_start_time: puzzleStartTime,
            puzzle_end_time: puzzleEndTime,
          }),
        });
      } catch (error) {
        console.error('Error submitting solution:', error);
      }
    }

    // Submit daily completion if all puzzles are won
    const allWon = newState.puzzles.every(p => p.status === 'won');
    if (allWon && newState.totalCompletionTimeMs && dailyChallenge) {
      try {
        const completionTimes: Record<number, number> = {};
        const solutionPaths: Record<number, string[]> = {};
        let totalSteps = 0;

        newState.puzzles.forEach(puzzle => {
          if (puzzle.completionTimeMs) {
            completionTimes[puzzle.length] = puzzle.completionTimeMs;
            solutionPaths[puzzle.length] = puzzle.wordChain;
            totalSteps += puzzle.moves;
          }
        });

        await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_date: dailyChallenge.date,
            total_time_ms: newState.totalCompletionTimeMs,
            completion_times: completionTimes,
            solution_paths: solutionPaths,
            total_steps: totalSteps,
          }),
        });

        // Check if user is in a challenge and submit
        const challengeCode = localStorage.getItem('activeChallengeCode');
        if (challengeCode) {
          const sessionId = localStorage.getItem(`challenge_${challengeCode}`) || 
                          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await fetch('/api/challenges/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challenge_code: challengeCode,
              session_id: sessionId,
              total_time_ms: newState.totalCompletionTimeMs,
              completion_times: completionTimes,
              solution_paths: solutionPaths,
              total_steps: totalSteps,
            }),
          });
        }
      } catch (error) {
        console.error('Error submitting daily completion:', error);
      }
    }
  }, [dailyGameState, dailyChallenge]);

  const handleResetPuzzle = useCallback((puzzleLength: number) => {
    if (!dailyGameState) {
      return;
    }
    
    const newState = resetPuzzle(dailyGameState, puzzleLength);
    setDailyGameState(newState);
    saveDailyGameStateToStorage(newState);
  }, [dailyGameState]);

  useEffect(() => {
    loadDailyChallenge();
  }, [loadDailyChallenge]);

  // Auto-save game state whenever it changes
  useEffect(() => {
    if (dailyGameState) {
      saveDailyGameStateToStorage(dailyGameState);
    }
  }, [dailyGameState]);

  return (
    <GameContext.Provider
      value={{
        dailyGameState,
        dailyChallenge,
        isLoading,
        error,
        submitWord: handleSubmitWord,
        resetPuzzle: handleResetPuzzle,
        loadDailyChallenge,
        activePuzzleLength,
        setActivePuzzleLength,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

