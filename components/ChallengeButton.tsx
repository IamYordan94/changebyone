'use client';

import { useState } from 'react';
import { createChallengeUrl } from '@/lib/challengeGenerator';

interface ChallengeButtonProps {
  challengeDate: string;
  onChallengeCreated?: (code: string, url: string) => void;
}

export default function ChallengeButton({ challengeDate, onChallengeCreated }: ChallengeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateChallenge = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_date: challengeDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      const challenge = await response.json();
      const url = createChallengeUrl(challenge.challenge_code);
      
      setChallengeCode(challenge.challenge_code);
      setChallengeUrl(url);
      
      if (onChallengeCreated) {
        onChallengeCreated(challenge.challenge_code, url);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!challengeUrl) return;

    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (challengeCode && challengeUrl) {
    return (
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="text-center">
          <p className="text-slate-300 text-sm mb-2">Challenge Created!</p>
          <div className="flex items-center gap-2 justify-center">
            <code className="px-3 py-1.5 bg-slate-800 rounded font-mono text-lg" style={{ color: 'var(--text-primary, var(--primary))' }}>
              {challengeCode}
            </code>
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Challenge Link'}
        </button>
        <p className="text-xs text-slate-400 text-center">
          Share this link to challenge friends!
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreateChallenge}
      disabled={isLoading}
      className="px-6 py-3 text-white font-semibold rounded-xl disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      style={{
        backgroundColor: isLoading
          ? 'color-mix(in srgb, var(--primary) 40%, #1e293b)'
          : 'var(--primary)',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.filter = 'brightness(1.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      {isLoading ? 'Creating...' : '🎯 Create Challenge'}
    </button>
  );
}

