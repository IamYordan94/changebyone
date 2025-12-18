'use client';

import { useEffect, useState } from 'react';
import type { UserSolution } from '@/types';

interface LeaderboardProps {
  challengeDate: string;
  wordLength?: number;
}

export default function Leaderboard({ challengeDate, wordLength }: LeaderboardProps) {
  const [solutions, setSolutions] = useState<UserSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const url = wordLength
          ? `/api/leaderboard?date=${challengeDate}&wordLength=${wordLength}`
          : `/api/leaderboard?date=${challengeDate}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSolutions(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
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
          {wordLength ? `${wordLength}-Letter Puzzle` : 'Daily Challenge'} Leaderboard
        </h3>
        <p className="text-slate-400">No solutions yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">
        {wordLength ? `${wordLength}-Letter Puzzle` : 'Daily Challenge'} - Top Solutions
      </h3>
      <div className="space-y-2">
        {solutions.slice(0, 10).map((solution, index) => (
          <div
            key={solution.id || index}
            className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold min-w-[2rem]" style={{ color: 'var(--text-primary, var(--primary))' }}>#{index + 1}</span>
              <span className="text-sm text-slate-200">
                {solution.solution_path.join(' → ').toUpperCase()}
              </span>
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-primary, var(--primary))' }}>{solution.steps} moves</span>
          </div>
        ))}
      </div>
    </div>
  );
}

