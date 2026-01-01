'use client';

import { useEffect, useState } from 'react';
import type { UserSolution } from '@/types';

interface PuzzleLeaderboardProps {
  challengeDate: string;
  wordLength: number;
}

export default function PuzzleLeaderboard({ challengeDate, wordLength }: PuzzleLeaderboardProps) {
  const [solutions, setSolutions] = useState<UserSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(
          `/api/leaderboard/puzzle?date=${challengeDate}&wordLength=${wordLength}`
        );
        if (response.ok) {
          const data = await response.json();
          setSolutions(data);
        }
      } catch (error) {
        console.error('Error fetching puzzle leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [challengeDate, wordLength]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-300">Loading leaderboard...</p>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">
          {wordLength}-Letter Puzzle Leaderboard
        </h3>
        <p className="text-slate-400">No solutions yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">
        ⚡ {wordLength}-Letter Puzzle - Fewest Steps
      </h3>
      <div className="space-y-2">
        {solutions.map((solution, index) => (
          <div
            key={solution.id || index}
            className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span
                className="font-bold min-w-[2rem]"
                style={{
                  color: index === 0 ? '#facc15' : index === 1 ? '#cbd5e1' : index === 2 ? '#d97706' : 'var(--primary)'
                }}
              >
                #{index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-slate-300">
                  {solution.username || 'Anonymous'}
                </span>
              </div>
            </div>
            <span className="font-semibold text-primary">
              {solution.steps} steps
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
