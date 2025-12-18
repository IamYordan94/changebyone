'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Challenge } from '@/types';
import ChallengeLeaderboard from '@/components/ChallengeLeaderboard';
import { isValidChallengeCode } from '@/lib/challengeGenerator';

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !isValidChallengeCode(code)) {
      setError('Invalid challenge code');
      setIsLoading(false);
      return;
    }

    async function fetchChallenge() {
      try {
        const response = await fetch(`/api/challenges/${code}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Challenge not found');
          } else {
            setError('Failed to load challenge');
          }
          return;
        }

        const data = await response.json();
        setChallenge(data);
      } catch (error) {
        console.error('Error fetching challenge:', error);
        setError('Failed to load challenge');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenge();
  }, [code]);

  const handleAcceptChallenge = async () => {
    try {
      // Generate a session ID for anonymous users
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/challenges/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_code: code,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept challenge');
      }

      // Store session ID in localStorage
      localStorage.setItem(`challenge_${code}`, sessionId);
      
      // Redirect to main game page
      router.push('/');
    } catch (error) {
      console.error('Error accepting challenge:', error);
      alert('Failed to accept challenge. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 mx-auto mb-4" style={{ borderTopColor: 'var(--primary)' }}></div>
          <p className="text-slate-300 text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <p className="text-red-400 text-xl font-semibold mb-2">Error</p>
          <p className="text-slate-300">{error || 'Challenge not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Go to Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Challenge Accepted!</h1>
          <p className="text-slate-300">
            Challenge Code: <code className="font-mono text-lg" style={{ color: 'var(--text-primary, var(--primary))' }}>{code}</code>
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Date: {challenge.challenge_date}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-slate-300 mb-4">
            Complete today's daily challenge to compete!
          </p>
          <button
            onClick={handleAcceptChallenge}
            className="px-8 py-3 text-white font-semibold rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Start Challenge
          </button>
        </div>

        <ChallengeLeaderboard challengeCode={code} />
      </div>
    </div>
  );
}

