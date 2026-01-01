'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [dailyGameState, setDailyGameState] = useState<DailyGameState | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePuzzleLength, setActivePuzzleLength] = useState<number | null>(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Use refs to check current state without adding to dependencies
  const dailyChallengeRef = useRef<DailyChallenge | null>(null);
  const dailyGameStateRef = useRef<DailyGameState | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    dailyChallengeRef.current = dailyChallenge;
  }, [dailyChallenge]);

  useEffect(() => {
    dailyGameStateRef.current = dailyGameState;
  }, [dailyGameState]);

  const loadDailyChallenge = useCallback(async () => {
    try {
      // Skip if we already have the challenge for this date
      if (dailyChallengeRef.current && dailyChallengeRef.current.date === selectedDate && dailyGameStateRef.current) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Quick check if words are loaded (don't wait if already loaded)
      try {
        const count = getTotalWordCount();
        if (count === 0) {
          // Words not loaded yet, wait briefly
          let wordsReady = false;
          let attempts = 0;
          while (!wordsReady && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            try {
              const checkCount = getTotalWordCount();
              if (checkCount > 0) {
                wordsReady = true;
              } else {
                attempts++;
              }
            } catch {
              attempts++;
            }
          }

          if (!wordsReady) {
            throw new Error('Word dictionary not loaded. Please refresh the page.');
          }
        }
      } catch {
        throw new Error('Word dictionary not loaded. Please refresh the page.');
      }

      // Fetch challenge for selected date from API
      const response = await fetch(`/api/challenges?date=${selectedDate}`);
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

      // If the API returned a different date (fallback to earliest available), update selectedDate
      // The check in loadDailyChallenge will prevent reloading if we already have this challenge
      if (challenge.date !== selectedDate) {
        setSelectedDate(challenge.date);
      }

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
  }, [selectedDate]); // Only depend on selectedDate - this is what should trigger reloads

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

    // Get username from localStorage
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') || undefined : undefined;

    // Submit solution if puzzle is won
    const updatedPuzzle = newState.puzzles.find(p => p.length === puzzleLength);
    if (updatedPuzzle?.status === 'won' && dailyChallenge) {
      try {
        await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_date: dailyChallenge.date,
            word_length: puzzleLength,
            solution_path: updatedPuzzle.wordChain,
            steps: updatedPuzzle.moves,
            username,
          }),
        });
      } catch (error) {
        console.error('Error submitting solution:', error);
      }
    }

    // Submit daily completion if all puzzles are won
    const allWon = newState.puzzles.every(p => p.status === 'won');
    if (allWon && dailyChallenge) {
      try {
        const solutionPaths: Record<number, string[]> = {};
        let totalSteps = 0;

        newState.puzzles.forEach(puzzle => {
          solutionPaths[puzzle.length] = puzzle.wordChain;
          totalSteps += puzzle.moves;
        });

        await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_date: dailyChallenge.date,
            solution_paths: solutionPaths,
            total_steps: totalSteps,
            username,
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
              solution_paths: solutionPaths,
              total_steps: totalSteps,
              username,
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

    const newState = resetPuzzle(dailyGameState, puzzleLength, false);
    setDailyGameState(newState);
    saveDailyGameStateToStorage(newState);
  }, [dailyGameState]);

  // Load challenge when selected date changes
  useEffect(() => {
    loadDailyChallenge();
  }, [loadDailyChallenge, selectedDate]);

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
        selectedDate,
        setSelectedDate,
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

