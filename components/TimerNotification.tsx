'use client';

import { useEffect, useState } from 'react';

interface TimerNotificationProps {
  elapsedTime: number; // in milliseconds
}

export default function TimerNotification({ elapsedTime }: TimerNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Show notification once when reaching 5 minutes
    if (elapsedTime >= fiveMinutes && !hasShown) {
      setShowNotification(true);
      setHasShown(true);
    }
  }, [elapsedTime, hasShown]);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="glass rounded-xl p-4 shadow-2xl border border-slate-600/50 max-w-xs">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-200 text-sm font-medium">
            No pressure
          </p>
          <button
            onClick={() => setShowNotification(false)}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

