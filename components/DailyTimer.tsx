'use client';

import { useEffect, useState } from 'react';
import type { PuzzleGameState } from '@/types';

interface DailyTimerProps {
  puzzles: PuzzleGameState[]; // All puzzle states
  totalCompletionTimeMs?: number; // Total time if all puzzles completed
  isComplete: boolean; // Whether all puzzles are completed
}

export default function DailyTimer({ puzzles, totalCompletionTimeMs, isComplete }: DailyTimerProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (isComplete && totalCompletionTimeMs !== undefined) {
      setElapsedMs(totalCompletionTimeMs);
      return;
    }

    // Update timer every 100ms
    const interval = setInterval(() => {
      // Calculate cumulative time: sum of completed puzzles + current active puzzle
      let cumulativeTime = 0;
      
      puzzles.forEach(puzzle => {
        if (puzzle.status === 'won' && puzzle.completionTimeMs) {
          // Add completed puzzle time
          cumulativeTime += puzzle.completionTimeMs;
        } else if (puzzle.status === 'playing' && puzzle.timerStartTime) {
          // Add time from currently active puzzle
          cumulativeTime += Date.now() - puzzle.timerStartTime;
        }
      });

      setElapsedMs(cumulativeTime);
    }, 100);

    return () => clearInterval(interval);
  }, [puzzles, totalCompletionTimeMs, isComplete]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(1, '0')}`;
  };

  // Check if any puzzle has started
  const hasStarted = puzzles.some(p => p.status === 'playing' || p.status === 'won' || p.status === 'lost');
  
  if (!hasStarted && !totalCompletionTimeMs) {
    return null;
  }

  const displayTime = totalCompletionTimeMs !== undefined ? totalCompletionTimeMs : elapsedMs;
  const isRunning = puzzles.some(p => p.status === 'playing');

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-sm font-medium">Cumulative Time:</span>
        <span className="text-2xl font-bold" style={{ color: isComplete ? '#4ade80' : 'var(--text-primary, var(--primary))' }}>
          {formatTime(displayTime)}
        </span>
      </div>
      {isRunning && !isComplete && (
        <div className="mt-2 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
          <span>Timer running...</span>
        </div>
      )}
      {!isRunning && !isComplete && hasStarted && (
        <div className="mt-2 text-xs text-slate-400 text-center">
          Timer paused • Start next puzzle to resume
        </div>
      )}
    </div>
  );
}

