'use client';

import { useEffect, useState } from 'react';
import type { DailyCompletion } from '@/types';

interface DailyLeaderboardProps {
  challengeDate: string;
}

export default function DailyLeaderboard({ challengeDate }: DailyLeaderboardProps) {
  const [completions, setCompletions] = useState<DailyCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/leaderboard/daily?date=${challengeDate}`);
        if (response.ok) {
          const data = await response.json();
          setCompletions(data);
        }
      } catch (error) {
        console.error('Error fetching daily leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [challengeDate]);

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

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-300">Loading leaderboard...</p>
      </div>
    );
  }

  if (completions.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">
          Daily Challenge Leaderboard
        </h3>
        <p className="text-slate-400">No completions yet. Be the first to complete all 6 puzzles!</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">
        🏆 Daily Challenge - Fastest Solvers
      </h3>
      <div className="space-y-2">
        {completions.map((completion, index) => (
          <div
            key={completion.id || index}
            className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span 
                className="font-bold min-w-[2rem]"
                style={{
                  color: index === 0 ? '#facc15' : index === 1 ? '#cbd5e1' : index === 2 ? '#d97706' : 'var(--text-primary, var(--primary))'
                }}
              >
                #{index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-slate-300">
                  {completion.user_id || 'Anonymous'}
                </span>
                {completion.total_steps && (
                  <span className="text-xs text-slate-400">
                    {completion.total_steps} total moves
                  </span>
                )}
              </div>
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-primary, var(--primary))' }}>
              {formatTime(completion.total_time_ms)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

