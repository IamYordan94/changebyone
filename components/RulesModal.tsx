'use client';

import { useState } from 'react';

export default function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Rules Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="glass p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-300"
        title="How to Play"
      >
        {/* Info Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-up">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative glass rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors"
            >
              ×
            </button>

            <h2 className="text-3xl font-black text-gradient mb-6">How to Play</h2>

            <div className="space-y-6 text-slate-300">
              <section>
                <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="text-2xl">•</span> Rules
                </h3>
                <ul className="space-y-2 list-none">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">1.</span>
                    <span>Change exactly <strong className="text-white">one letter</strong> per move</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">2.</span>
                    <span>Each new word must be a <strong className="text-white">valid English word</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">3.</span>
                    <span>You have a <strong className="text-white">limited number of moves</strong> per puzzle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">4.</span>
                    <span>Complete all <strong className="text-white">6 daily puzzles</strong> (3-8 letters)</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="text-2xl">•</span> Example
                </h3>
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                  <p className="mb-2 text-sm">Transform <strong className="text-primary">CAT</strong> → <strong className="text-secondary">DOG</strong>:</p>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                    <span className="px-3 py-1 bg-slate-700/50 rounded">CAT</span>
                    <span className="text-slate-500">→</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded">COT</span>
                    <span className="text-slate-500">→</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded">DOT</span>
                    <span className="text-slate-500">→</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded">DOG</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 ml-2 inline-block">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="text-2xl">•</span> Daily Challenge
                </h3>
                <p className="leading-relaxed">
                  New puzzles appear daily. Complete all 6 puzzles as fast as possible to climb the leaderboard! Your time starts when you begin the first puzzle and stops when you complete the last one.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="text-2xl">•</span> Customize
                </h3>
                <p className="leading-relaxed">
                  Use the theme switcher in the top-right corner to personalize your experience with different color schemes.
                </p>
              </section>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-8 w-full px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(to right, var(--primary), var(--secondary))'
              }}
            >
              Got it! Let's Play
            </button>
          </div>
        </div>
      )}
    </>
  );
}

