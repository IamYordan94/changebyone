'use client';

import { useEffect, useState } from 'react';
import type { Challenge } from '@/types';

interface ChallengeLeaderboardProps {
  challengeCode: string;
}

export default function ChallengeLeaderboard({ challengeCode }: ChallengeLeaderboardProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const response = await fetch(`/api/challenges/${challengeCode}`);
        if (response.ok) {
          const data = await response.json();
          setChallenge(data);
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenge();
  }, [challengeCode]);

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
        <p className="text-slate-300">Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-slate-400">Challenge not found</p>
      </div>
    );
  }

  const participants = challenge.participants 
    ? Object.values(challenge.participants)
        .filter((p: any) => p.completion_time_ms !== undefined && p.completion_time_ms !== null)
        .sort((a: any, b: any) => (a.completion_time_ms || Infinity) - (b.completion_time_ms || Infinity))
    : [];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">
        🏆 Challenge Leaderboard
      </h3>
      <div className="mb-4 text-sm text-slate-400">
        Code: <code style={{ color: 'var(--text-primary, var(--primary))' }}>{challengeCode}</code>
      </div>
      
      {participants.length === 0 ? (
        <p className="text-slate-400 text-center py-4">
          No completions yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {participants.map((participant: any, index: number) => (
            <div
              key={index}
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
                <span className="text-sm text-slate-300">
                  {participant.user_id || 'Anonymous'}
                </span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary, var(--primary))' }}>
                {formatTime(participant.completion_time_ms)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

