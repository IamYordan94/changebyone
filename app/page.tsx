'use client';

import { GameProvider } from '@/contexts/GameContext';
import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen">
        <GameBoard />
      </main>
    </GameProvider>
  );
}
