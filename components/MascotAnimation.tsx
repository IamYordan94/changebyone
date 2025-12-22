'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MascotAnimationProps {
  state: 'idle' | 'success' | 'thinking' | 'error';
  show?: boolean;
}

export default function MascotAnimation({ state, show = true }: MascotAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && (state === 'success' || state === 'error')) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    } else if (state === 'thinking') {
      setIsVisible(show);
    } else {
      setIsVisible(false);
    }
  }, [state, show]);

  if (!isVisible) return null;

  const getMascotImage = () => {
    switch (state) {
      case 'success':
        return '/assets/mascot-success.png';
      case 'thinking':
      case 'idle':
        return '/assets/mascot-thinking.png';
      case 'error':
        return '/assets/mascot-thinking.png'; // Use thinking for error too
      default:
        return '/assets/mascot-thinking.png';
    }
  };

  const getAnimation = () => {
    switch (state) {
      case 'success':
        return 'animate-bounce';
      case 'thinking':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
      }}
    >
      <div className={getAnimation()}>
        <Image
          src={getMascotImage()}
          alt="Game mascot"
          width={150}
          height={150}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
