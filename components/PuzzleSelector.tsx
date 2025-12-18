'use client';

import type { PuzzleGameState } from '@/types';

interface PuzzleSelectorProps {
  puzzles: PuzzleGameState[];
  activeLength: number;
  onSelect: (length: number) => void;
}

export default function PuzzleSelector({ puzzles, activeLength, onSelect }: PuzzleSelectorProps) {
  const getStatusIcon = (status: PuzzleGameState['status']) => {
    switch (status) {
      case 'won':
        return '✓';
      case 'lost':
        return '✗';
      case 'playing':
        return '●';
      case 'not_started':
        return '○';
    }
  };

  const getStatusStyle = (status: PuzzleGameState['status'], isActive: boolean) => {
    const base = 'px-4 py-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-sm';
    
    if (isActive) {
      return `${base} border-2 ring-2 scale-105 shadow-lg glow-blue`;
    }

    switch (status) {
      case 'won':
        return `${base} bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-300 hover:border-green-500/60`;
      case 'lost':
        return `${base} bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300 hover:border-red-500/60`;
      case 'playing':
        return `${base} border-slate-600/40`;
      case 'not_started':
        return `${base} glass border-slate-600/40 text-slate-400 hover:border-slate-500/60`;
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {puzzles.map((puzzle) => {
        const isActive = puzzle.length === activeLength;
        const statusIcon = getStatusIcon(puzzle.status);

        return (
          <button
            key={puzzle.length}
            onClick={() => onSelect(puzzle.length)}
            className={getStatusStyle(puzzle.status, isActive)}
            style={
              isActive
                ? {
                    background: `linear-gradient(to bottom right, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, var(--secondary) 30%, transparent))`,
                    borderColor: 'color-mix(in srgb, var(--primary) 60%, transparent)',
                    '--tw-ring-color': 'color-mix(in srgb, var(--primary) 30%, transparent)',
                    color: 'var(--text-primary, var(--primary))',
                  } as React.CSSProperties
                : puzzle.status === 'playing'
                ? {
                    background: `linear-gradient(to bottom right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--secondary) 20%, transparent))`,
                    borderColor: 'color-mix(in srgb, var(--primary) 40%, transparent)',
                    color: 'var(--text-primary, var(--primary))',
                  } as React.CSSProperties
                : undefined
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">{puzzle.length}</span>
              <span className="text-xs uppercase tracking-wider">letters</span>
              <span className="text-lg">{statusIcon}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

