'use client';

import { useState, useEffect } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameBoard from '@/components/GameBoard';
import UsernameModal from '@/components/UsernameModal';

export default function Home() {
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    // Check if username exists in localStorage
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      setShowUsernameModal(true);
    }
  }, []);

  const handleUsernameSet = (username: string) => {
    setShowUsernameModal(false);
  };

  return (
    <>
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameSet}
      />
      <GameProvider>
        <main className="min-h-screen">
          <GameBoard />
        </main>
      </GameProvider>
    </>
  );
}
