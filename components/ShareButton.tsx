'use client';

import { useState } from 'react';
import type { GameState } from '@/types';

interface ShareButtonProps {
  gameState: GameState;
}

export default function ShareButton({ gameState }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = (): string => {
    if (gameState.status !== 'won') {
      return 'I\'m playing Change by One!';
    }

    const path = gameState.wordChain.join(' → ');
    return `Change by One - Solved in ${gameState.moves} moves!\n\n${path.toUpperCase()}\n\nPlay at: [your-url]`;
  };

  const handleShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Change by One',
          text: text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (gameState.status !== 'won') {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/30"
    >
      {copied ? '✓ Copied!' : '📤 Share Result'}
    </button>
  );
}
