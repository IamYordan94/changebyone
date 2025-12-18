'use client';

import { useEffect, useState } from 'react';
import { initializeWordDictionary } from '@/lib/loadWords';

let wordsLoading = false;
let wordsLoaded = false;
const loadPromise = new Promise<void>((resolve, reject) => {
  if (wordsLoaded) {
    resolve();
    return;
  }
  
  if (wordsLoading) {
    // Wait for existing load
    const checkInterval = setInterval(() => {
      if (wordsLoaded) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    return;
  }
  
  wordsLoading = true;
  initializeWordDictionary()
    .then(() => {
      wordsLoaded = true;
      wordsLoading = false;
      resolve();
    })
    .catch((err) => {
      wordsLoading = false;
      reject(err);
    });
});

export default function WordLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') {
      return;
    }

    loadPromise
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load words';
        setError(errorMessage);
        console.error('Word loading error:', err);
      });
  }, []);

  // Show loading state if words aren't loaded yet
  if (!isLoaded && !error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word dictionary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-red-50 flex items-center justify-center z-50">
        <div className="text-center text-red-600 max-w-md p-6">
          <p className="text-lg font-semibold mb-2">Error Loading Words</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-4 text-gray-500">
            Please ensure words.json exists in the public folder.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

