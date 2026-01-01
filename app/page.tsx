'use client';

import { useState, useEffect } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameBoard from '@/components/GameBoard';
import UsernameModal from '@/components/UsernameModal';

export default function Home() {
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameSet, setUsernameSet] = useState(false);

  useEffect(() => {
    // Check if username exists in localStorage
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      setShowUsernameModal(true);
    } else {
      setUsernameSet(true);
    }
  }, []);

  const handleUsernameSet = (username: string) => {
    setShowUsernameModal(false);
    setUsernameSet(true);
  };

  return (
    <>
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameSet}
      />
      {usernameSet && (
        <GameProvider>
          <main className="min-h-screen">
            <GameBoard />
          </main>
        </GameProvider>
      )}
    </>
  );
}
