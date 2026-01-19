'use client';

export default function RulesModalContent() {
  return (
    <div className="space-y-4 sm:space-y-6 text-slate-300 text-sm sm:text-base">
      <section>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-2 sm:mb-3 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">•</span> Rules
        </h3>
        <ul className="space-y-2 list-none pl-0 sm:pl-2">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary font-bold flex-shrink-0">1.</span>
            <span>Change exactly <strong className="text-white">one letter</strong> per move</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary font-bold flex-shrink-0">2.</span>
            <span>Each new word must be a <strong className="text-white">valid English word</strong></span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary font-bold flex-shrink-0">3.</span>
            <span>You have a <strong className="text-white">limited number of moves</strong> per puzzle</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary font-bold flex-shrink-0">4.</span>
            <span>Complete all <strong className="text-white">6 daily puzzles</strong> (3-8 letters)</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-2 sm:mb-3 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">•</span> Example
        </h3>
        <div className="bg-slate-800/40 rounded-xl p-3 sm:p-4 border border-slate-700/50">
          <p className="mb-2 text-xs sm:text-sm">Transform <strong className="text-primary">CAT</strong> → <strong className="text-secondary">DOG</strong>:</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-xs sm:text-sm">
            <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded">CAT</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded">COT</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded">DOT</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded">DOG</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 ml-1 sm:ml-2 inline-block">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-2 sm:mb-3 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">•</span> Daily Challenge
        </h3>
        <p className="leading-relaxed text-sm sm:text-base">
          New puzzles appear daily. Complete all 6 puzzles as fast as possible to climb the leaderboard! Your time starts when you begin the first puzzle and stops when you complete the last one.
        </p>
      </section>

      <section>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-2 sm:mb-3 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">•</span> Customize
        </h3>
        <p className="leading-relaxed text-sm sm:text-base">
          Use the theme switcher in the top-right corner to personalize your experience with different color schemes.
        </p>
      </section>
    </div>
  );
}
