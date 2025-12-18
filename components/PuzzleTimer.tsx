'use client';

import { useEffect, useState } from 'react';

interface PuzzleTimerProps {
  startTime?: number; // Date.now() when puzzle started
  completionTimeMs?: number; // Time taken if completed
  isActive: boolean; // Whether puzzle is currently active
}

export default function PuzzleTimer({ startTime, completionTimeMs, isActive }: PuzzleTimerProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (!isActive || !startTime || completionTimeMs !== undefined) {
      if (completionTimeMs !== undefined) {
        setElapsedMs(completionTimeMs);
      }
      return;
    }

    // Update timer every 100ms for smooth display
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedMs(now - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, completionTimeMs, isActive]);

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

  if (!startTime && !completionTimeMs) {
    return null;
  }

  const displayTime = completionTimeMs !== undefined ? completionTimeMs : elapsedMs;

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-300 text-sm font-medium">Time:</span>
      <span className="text-lg font-bold" style={{ color: isActive && !completionTimeMs ? 'var(--text-primary, var(--primary))' : '#4ade80' }}>
        {formatTime(displayTime)}
      </span>
      {isActive && !completionTimeMs && (
        <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
      )}
    </div>
  );
}

