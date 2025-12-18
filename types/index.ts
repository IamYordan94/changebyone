export type Difficulty = 'easy' | 'medium' | 'hard';

// Legacy GameState (kept for backward compatibility during migration)
export interface GameState {
  currentWord: string;
  targetWord: string;
  wordChain: string[];
  moves: number;
  maxMoves: number;
  status: 'playing' | 'won' | 'lost';
  difficulty: Difficulty;
  dailyChallengeDate: string;
  errors: string[];
}

// New types for multi-puzzle daily challenges
export interface Puzzle {
  length: number;
  start_word: string;
  end_word: string;
  optimal_steps: number;
  max_moves: number;
}

export interface DailyChallenge {
  date: string;
  puzzles: Puzzle[];
}

// Legacy DailyChallenge (database row format)
export interface DailyChallengeRow {
  id: string;
  date: string;
  start_word: string;
  end_word: string;
  word_length: number;
  optimal_steps: number;
  max_moves: number;
  created_at: string;
}

export interface PuzzleGameState {
  length: number;
  start_word: string;
  end_word: string;
  currentWord: string;
  wordChain: string[];
  moves: number;
  maxMoves: number;
  status: 'not_started' | 'playing' | 'won' | 'lost';
  errors: string[];
  timerStartTime?: number; // Date.now() when puzzle started
  completionTimeMs?: number; // Time taken to complete in milliseconds
}

export interface DailyGameState {
  date: string;
  puzzles: PuzzleGameState[];
  overallProgress: number; // e.g., 3/7 completed
  dailyTimerStartTime?: number; // Date.now() when first puzzle started
  totalCompletionTimeMs?: number; // Total time for all puzzles in milliseconds
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UserSolution {
  id?: string;
  challenge_date: string;
  word_length: number;
  solution_path: string[];
  steps: number;
  user_id?: string;
  created_at?: string;
  completion_time_ms?: number;
  puzzle_start_time?: string;
  puzzle_end_time?: string;
}

export interface DailyCompletion {
  id?: string;
  challenge_date: string;
  user_id?: string;
  total_time_ms: number;
  completion_times: Record<number, number>; // { 3: 45000, 4: 60000, ... }
  solution_paths?: Record<number, string[]>; // { 3: ["cat", "cot", ...], ... }
  total_steps?: number;
  completed_at?: string;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'completed' | 'expired';

export interface ChallengeParticipant {
  user_id?: string;
  completion_time_ms?: number;
  completed_at?: string;
  solution_paths?: Record<number, string[]>;
}

export interface Challenge {
  id?: string;
  challenge_code: string;
  challenger_id?: string;
  challenge_date: string;
  status: ChallengeStatus;
  participants: Record<string, ChallengeParticipant>; // key is user_id or session_id
  created_at?: string;
  expires_at?: string;
}

