'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import WordDisplay from './WordDisplay';
import TargetWord from './TargetWord';
import WordInput from './WordInput';
import MoveCounter from './MoveCounter';
import WordChain from './WordChain';
import FeedbackMessage from './FeedbackMessage';
import ShareButton from './ShareButton';
import Leaderboard from './Leaderboard';
import HintButton from './HintButton';
import PuzzleSelector from './PuzzleSelector';
import ProgressIndicator from './ProgressIndicator';
import PuzzleTimer from './PuzzleTimer';
import DailyTimer from './DailyTimer';
import DailyLeaderboard from './DailyLeaderboard';
import PuzzleLeaderboard from './PuzzleLeaderboard';
import ChallengeButton from './ChallengeButton';
import ThemeSwitcher from './ThemeSwitcher';
import RulesModal from './RulesModal';
import TimerNotification from './TimerNotification';
import LeaderboardModal from './LeaderboardModal';
import MascotAnimation from './MascotAnimation';
import DatePicker from './DatePicker';
import ResetConfirmModal from './ResetConfirmModal';

export default function GameBoard() {
  const {
    dailyGameState,
    dailyChallenge,
    isLoading,
    error,
    submitWord,
    resetPuzzle,
    activePuzzleLength,
    setActivePuzzleLength,
    selectedDate,
    setSelectedDate,
  } = useGame();
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintsUsedPerPuzzle, setHintsUsedPerPuzzle] = useState<Record<number, number>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);

  // Get active puzzle state
  const activePuzzle = dailyGameState?.puzzles.find(
    p => p.length === activePuzzleLength
  );

  // Calculate cumulative elapsed time for timer notification
  useEffect(() => {
    const interval = setInterval(() => {
      let cumulativeTime = 0;
      dailyGameState?.puzzles.forEach(puzzle => {
        if (puzzle.status === 'won' && puzzle.completionTimeMs) {
          cumulativeTime += puzzle.completionTimeMs;
        } else if (puzzle.status === 'playing' && puzzle.timerStartTime) {
          cumulativeTime += Date.now() - puzzle.timerStartTime;
        }
      });
      setElapsedTime(cumulativeTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [dailyGameState?.puzzles]);

  // Clear hint message when switching puzzles
  useEffect(() => {
    setHintMessage(null);
  }, [activePuzzleLength]);

  // Submit solution when puzzle is won
  useEffect(() => {
    if (activePuzzle?.status === 'won' && dailyChallenge) {
      fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_date: dailyChallenge.date,
          word_length: activePuzzle.length,
          solution_path: activePuzzle.wordChain,
          steps: activePuzzle.moves,
        }),
      }).catch(console.error);
    }
  }, [activePuzzle?.status, activePuzzle?.wordChain, activePuzzle?.moves, activePuzzle?.length, dailyChallenge]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in-up">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 mx-auto mb-6" style={{ borderTopColor: 'var(--primary)' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: 'var(--secondary)', animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-300 text-xl font-medium mt-4">Loading challenge...</p>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--secondary)', animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center glass rounded-3xl p-10 max-w-md animate-fade-in-up">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-2xl font-bold mb-3">Error loading game</p>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!dailyGameState || !activePuzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">No game state available</p>
      </div>
    );
  }

  const isGameOver = activePuzzle.status === 'won' || activePuzzle.status === 'lost';
  const completedCount = dailyGameState.puzzles.filter(p => p.status === 'won').length;

  const handleSubmitWord = (word: string) => {
    if (activePuzzleLength) {
      submitWord(activePuzzleLength, word);
    }
  };

  const handleHint = (hint: string, nextWord?: string) => {
    setHintMessage(hint);

    if (nextWord && activePuzzleLength) {
      // Track hint usage
      setHintsUsedPerPuzzle(prev => ({
        ...prev,
        [activePuzzleLength]: (prev[activePuzzleLength] || 0) + 1
      }));
    }
  };

  const hintsRemaining = activePuzzleLength ? 2 - (hintsUsedPerPuzzle[activePuzzleLength] || 0) : 2;

  const handleReset = () => {
    if (activePuzzleLength) {
      resetPuzzle(activePuzzleLength);
      setShowResetModal(false);
    }
  };

  // Mascot state
  const getMascotState = (): 'idle' | 'success' | 'thinking' | 'error' => {
    if (activePuzzle.status === 'won') return 'success';
    if (activePuzzle.status === 'lost') return 'error';
    if (activePuzzle.status === 'playing' && activePuzzle.moves > 0) return 'thinking';
    return 'idle';
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in-up">
      {/* Mascot Animation */}
      <MascotAnimation state={getMascotState()} show={true} />

      {/* Timer Notification - 5 minute reminder */}
      <TimerNotification elapsedTime={elapsedTime} />

      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* Controls - Top right corner */}
        <div className="absolute top-0 right-0 z-40 flex items-center gap-3">
          <RulesModal />
          <LeaderboardModal />
          <ThemeSwitcher />
        </div>

        {/* Header - Change by One */}
        <div className="text-center mb-10">
          <div className="space-y-4">
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gradient">
              Change<span className="text-2xl md:text-3xl mx-1 md:mx-2">by</span>One
            </h1>

            {/* Objective - Always Visible */}
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Transform the starting word into the target word by changing <strong className="text-white">one letter at a time</strong>.
            </p>

            {/* Date Picker */}
            <div className="flex justify-center mt-4">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Daily Timer - Cumulative across all puzzles */}
        <DailyTimer
          puzzles={dailyGameState.puzzles}
          totalCompletionTimeMs={dailyGameState.totalCompletionTimeMs}
          isComplete={completedCount === dailyGameState.puzzles.length}
        />

        {/* Puzzle Selector with Progress - Compact */}
        <div className="glass rounded-2xl p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-200">
              Select Puzzle
            </h2>
            <div className="flex-1 max-w-xs ml-4">
              <ProgressIndicator
                completed={completedCount}
                total={dailyGameState.puzzles.length}
              />
            </div>
          </div>
          <PuzzleSelector
            puzzles={dailyGameState.puzzles}
            activeLength={activePuzzleLength || activePuzzle.length}
            onSelect={setActivePuzzleLength}
          />
        </div>

        {/* Main Game Card - Enhanced */}
        <div className="glass rounded-3xl p-10 space-y-8 shadow-2xl animate-fade-in-up transition-all duration-500">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white mb-3">
              {activePuzzle.length}-Letter Puzzle
            </h2>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-xl font-bold text-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 20%, transparent)', borderWidth: '1px', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)', color: 'var(--text-primary, var(--primary))' }}>
                {activePuzzle.start_word.toUpperCase()}
              </span>
              <span className="text-2xl text-slate-400">→</span>
              <span className="px-4 py-2 rounded-xl font-bold text-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--secondary) 20%, transparent)', borderWidth: '1px', borderColor: 'color-mix(in srgb, var(--secondary) 30%, transparent)', color: 'var(--text-secondary, var(--secondary))' }}>
                {activePuzzle.end_word.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <MoveCounter moves={activePuzzle.moves} maxMoves={activePuzzle.maxMoves} />
            <PuzzleTimer
              startTime={activePuzzle.timerStartTime}
              completionTimeMs={activePuzzle.completionTimeMs}
              isActive={activePuzzle.status === 'playing'}
            />
          </div>

          {activePuzzle.errors.length > 0 && (
            <FeedbackMessage
              type="error"
              message={activePuzzle.errors[activePuzzle.errors.length - 1]}
            />
          )}

          {activePuzzle.status === 'won' && (
            <FeedbackMessage
              type="success"
              message={`🎉 Congratulations! You solved it in ${activePuzzle.moves} moves!`}
            />
          )}

          {activePuzzle.status === 'lost' && (
            <FeedbackMessage
              type="error"
              message="Out of moves! Better luck tomorrow."
            />
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <HintButton
              gameState={{
                currentWord: activePuzzle.currentWord,
                targetWord: activePuzzle.end_word,
                wordChain: activePuzzle.wordChain,
                moves: activePuzzle.moves,
                maxMoves: activePuzzle.maxMoves,
                status: activePuzzle.status === 'won' ? 'won' : activePuzzle.status === 'lost' ? 'lost' : 'playing',
                difficulty: 'medium',
                dailyChallengeDate: dailyGameState.date,
                errors: activePuzzle.errors,
              }}
              onHint={handleHint}
              hintsRemaining={hintsRemaining}
              startWord={activePuzzle.start_word}
              optimalSteps={dailyChallenge?.puzzles.find(p => p.length === activePuzzle.length)?.optimal_steps || 0}
            />
            {(activePuzzle.status === 'playing' || activePuzzle.status === 'not_started') && (
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 flex items-center gap-2 text-slate-300 hover:text-slate-100"
                title="Reset puzzle (timer continues)"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span className="font-medium">Reset</span>
              </button>
            )}
            {activePuzzle.status === 'won' && (
              <ShareButton
                gameState={{
                  currentWord: activePuzzle.currentWord,
                  targetWord: activePuzzle.end_word,
                  wordChain: activePuzzle.wordChain,
                  moves: activePuzzle.moves,
                  maxMoves: activePuzzle.maxMoves,
                  status: 'won',
                  difficulty: 'medium',
                  dailyChallengeDate: dailyGameState.date,
                  errors: [],
                }}
              />
            )}
          </div>

          {/* Next Challenge Button */}
          {activePuzzle.status === 'won' && (() => {
            const nextPuzzle = dailyGameState.puzzles.find(p =>
              p.length > activePuzzle.length && p.status !== 'won'
            );

            return nextPuzzle ? (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setActivePuzzleLength(nextPuzzle.length)}
                  className="px-8 py-3 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  <span>Next Challenge</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            ) : completedCount === dailyGameState.puzzles.length ? (
              <div className="flex justify-center mt-4">
                <div className="px-6 py-2 bg-green-500/20 border border-green-500/40 rounded-xl">
                  <p className="text-green-400 font-semibold text-sm">
                    🎉 All challenges completed!
                  </p>
                </div>
              </div>
            ) : null;
          })()}

          {hintMessage && (
            <FeedbackMessage type="info" message={hintMessage} />
          )}

          <WordChain chain={activePuzzle.wordChain} />

          <WordInput
            onSubmit={handleSubmitWord}
            disabled={isGameOver}
            currentLength={activePuzzle.currentWord.length}
          />
        </div>

        {/* Challenge Button */}
        {completedCount === dailyGameState.puzzles.length && dailyChallenge && (
          <div className="glass rounded-3xl p-8 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-6 text-slate-200 text-center">
              Challenge Your Friends! 🎯
            </h3>
            <ChallengeButton challengeDate={dailyChallenge.date} />
          </div>
        )}


        {/* Challenge of the Day - Bottom of Page */}
        <div className="mt-12 text-center pb-6">
          <div className="inline-block px-5 py-2 bg-slate-900/70 backdrop-blur-md rounded-full border shadow-lg" style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            <p className="text-slate-400 text-xs font-medium tracking-wide">
              Challenge of the Day • {dailyChallenge?.date || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
