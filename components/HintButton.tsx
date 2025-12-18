'use client';

import { useState, useEffect } from 'react';
import { calculateOptimalPath } from '@/lib/gameLogic';
import { getWordsByLength } from '@/lib/words';
import type { GameState } from '@/types';

interface HintButtonProps {
  gameState: GameState;
  onHint: (hint: string, nextWord?: string) => void;
  hintsRemaining?: number;
  startWord: string;
  optimalSteps: number;
}

export default function HintButton({ gameState, onHint, hintsRemaining = 2, startWord, optimalSteps }: HintButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimalPath, setOptimalPath] = useState<string[]>([]);

  useEffect(() => {
    // Calculate optimal path once when component mounts
    const dictionary = getWordsByLength(startWord.length);
    const path = calculateOptimalPath(startWord, gameState.targetWord, dictionary);
    setOptimalPath(path);
  }, [startWord, gameState.targetWord]);

  const handleGetHint = () => {
    if (hintsRemaining <= 0) {
      onHint('No hints remaining for this puzzle!');
      return;
    }

    setIsLoading(true);

    // Get the next word from optimal path based on current progress
    const currentIndex = gameState.wordChain.length - 1; // -1 because wordChain includes start word
    
    if (optimalPath && currentIndex < optimalPath.length - 1) {
      const nextWord = optimalPath[currentIndex + 1];
      setTimeout(() => {
        onHint(`Next word: ${nextWord.toUpperCase()}`, nextWord);
        setIsLoading(false);
      }, 500);
    } else {
      onHint('Unable to provide hint.');
      setIsLoading(false);
    }
  };

  if (gameState.status !== 'playing') {
    return null;
  }

  // Lock hints if within last 2 moves of optimal solution
  const currentProgress = gameState.wordChain.length - 1; // Don't count start word
  const isLockedByProgress = currentProgress >= optimalSteps - 2;
  const isDisabled = isLoading || hintsRemaining <= 0 || isLockedByProgress;

  return (
    <button
      onClick={handleGetHint}
      disabled={isDisabled}
      className="px-6 py-3 bg-slate-700/60 border border-slate-600/50 text-slate-200 font-semibold rounded-xl hover:bg-slate-700/80 hover:border-slate-500/50 disabled:bg-slate-800/40 disabled:border-slate-700/30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg disabled:shadow-none backdrop-blur-sm flex items-center gap-2"
      title={isLockedByProgress ? 'Hints locked for final 2 moves' : ''}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      {isLoading ? 'Loading...' : `Hint (${hintsRemaining} left)`}
    </button>
  );
}
