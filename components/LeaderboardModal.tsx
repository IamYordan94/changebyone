'use client';

import { useState, useEffect } from 'react';
import type { DailyCompletion, DailyGameState, PuzzleGameState } from '@/types';

type MyDayStats = {
  date: string;
  puzzles: Array<{
    word_length: number;
    steps: number;
    status: PuzzleGameState['status'];
  }>;
  completed: boolean;
  total_steps: number;
};

export default function LeaderboardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'global'>('my');
  const [myDays, setMyDays] = useState<MyDayStats[]>([]);
  const [globalStats, setGlobalStats] = useState<DailyCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'my') {
      // Local-only stats from this browser/device.
      setIsLoading(false);
      setMyDays(loadMyStatsFromLocalStorage());
      return;
    }

    // Global all-time best completions (server).
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/leaderboard/daily?global=true');
        if (response.ok) {
          const data = await response.json();
          setGlobalStats(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen, activeTab]);

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
    }
    return `${seconds}.${milliseconds}s`;
  };

  const loadMyStatsFromLocalStorage = (): MyDayStats[] => {
    if (typeof window === 'undefined') return [];

    const prefix = 'dailyGameState_';
    const states: DailyGameState[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as DailyGameState;
        if (!parsed?.date || !Array.isArray(parsed.puzzles)) continue;
        states.push(parsed);
      }
    } catch (e) {
      console.error('Failed reading local stats:', e);
      return [];
    }

    const days = states.map((state): MyDayStats => {
      const puzzles = state.puzzles
        .map((p) => ({
          word_length: p.length,
          steps: p.moves,
          status: p.status,
        }))
        .sort((a, b) => a.word_length - b.word_length);

      const completedCount = puzzles.filter((p) => p.status === 'won').length;
      const totalSteps = puzzles.reduce((sum, p) => sum + p.steps, 0);

      return {
        date: state.date,
        puzzles,
        completed: completedCount === state.puzzles.length,
        total_steps: totalSteps,
      };
    });

    return days.sort((a, b) => b.date.localeCompare(a.date));
  };

  return (
    <>
      {/* Leaderboard Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="glass p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-300"
        title="Leaderboard"
      >
        {/* Trophy Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
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
          <div className="relative glass rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors"
            >
              ×
            </button>

            <h2 className="text-3xl font-black text-gradient mb-6">Leaderboard</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('my')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'my'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                style={activeTab === 'my' ? {
                  background: 'linear-gradient(to right, var(--primary), var(--secondary))'
                } : undefined}
              >
                My Stats
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'global'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                style={activeTab === 'global' ? {
                  background: 'linear-gradient(to right, var(--primary), var(--secondary))'
                } : undefined}
              >
                Global
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 mx-auto mb-4" style={{ borderTopColor: 'var(--primary)' }}></div>
                  <p className="text-slate-300">Loading...</p>
                </div>
              ) : activeTab === 'my' ? (
                <div className="space-y-6">
                  <div className="bg-slate-800/60 rounded-lg p-3">
                    <p className="text-slate-300 text-sm">
                      <strong className="text-white">My Stats</strong> are stored locally on this device/browser only.
                      Clearing site data will reset them.
                    </p>
                  </div>

                  {myDays.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 text-lg">No stats yet. Complete some puzzles to see your progress!</p>
                    </div>
                  ) : (
                    myDays.map((day) => (
                      <div key={day.date} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate-200">{day.date}</h3>
                          <div className="text-right">
                            <div className="text-xs text-slate-400">{day.completed ? '6/6' : `${day.puzzles.filter(p => p.status === 'won').length}/6`} puzzles</div>
                            {day.total_steps > 0 && (
                              <div className="text-xs text-slate-400">Total: {day.total_steps} steps</div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {day.puzzles.map((p) => (
                            <div
                              key={`${day.date}-${p.word_length}`}
                              className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                            >
                              <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                                <span>{p.word_length} Letters</span>
                                {p.status === 'won' ? (
                                  <span className="text-green-400">{p.steps} steps</span>
                                ) : (
                                  <span className="text-slate-500">{p.status === 'not_started' ? '—' : p.status}</span>
                                )}
                              </div>
                              <div className="font-bold text-slate-200">{p.steps} moves</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {globalStats.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 text-lg">No global completions yet!</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-800/60 rounded-lg p-3 mb-4">
                        <p className="text-slate-300 text-sm">
                          <strong className="text-white">Top 100</strong> fastest times for completing all 6 daily puzzles
                          {' '}— measured as the <strong className="text-white">sum of each puzzle’s active time</strong>
                          {' '}(pauses between puzzles don’t count).
                        </p>
                      </div>
                      {globalStats.map((completion, index) => (
                        <div
                          key={completion.id || index}
                          className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <span
                                className="font-bold text-xl min-w-[3rem]"
                                style={{
                                  color: index === 0 ? '#facc15' : index === 1 ? '#cbd5e1' : index === 2 ? '#d97706' : 'var(--text-primary, var(--primary))'
                                }}
                              >
                                #{index + 1}
                              </span>
                              <div className="flex-1">
                                <div className="text-slate-200 font-semibold text-lg">
                                  {completion.total_steps} steps
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {completion.challenge_date}
                                  {completion.username && ` • ${completion.username}`}
                                </div>
                              </div>
                            </div>
                            {index < 3 && (
                              <div className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

