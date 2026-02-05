// ── Guess / Game types ──────────────────────────────────────────────

export interface GuessRequest {
  puzzle_date_iso_day: string;
  word_guessed: string;
}

export type LetterGrade = 'correct' | 'contained' | 'wrong';

export interface GradedLetter {
  letter: string;
  grade: LetterGrade;
}

export type GradedMove = GradedLetter[];

export interface GameState {
  game_id: string;
  user_id: string;
  moves_qty: number;
  won: boolean;
  moves: GradedMove[];
}

export interface SubmitGuessOptions {
  token?: string;
}

export interface GetGameProgressOptions {
  token?: string;
}

// ── History types ───────────────────────────────────────────────────

/** Raw API response shape (internal) */
export interface GameRecord {
  game_id: string;
  puzzle_date: string;
  guesses_count: number;
  won: boolean;
  in_progress: boolean;
  graded_guesses?: LetterGrade[][];
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  puzzle_date: string;
  played: boolean;
  won?: boolean;
  guesses?: GradedMove[];
  guess_count?: number;
  in_progress?: boolean;
}

/** Raw API response wrapper (internal) */
export interface HistoryResponse {
  entries: HistoryEntry[];
  total_games: number;
  games_won: number;
}

// ── Profile types ───────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  avatarUrl: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

// ── Puzzle types ────────────────────────────────────────────────────

export interface SetPuzzleRequestCustom {
  date: string;
  word: string;
}

export interface SetPuzzleRequestRandom {
  date: string;
  set_random_unused_word: true;
}

export type SetPuzzleRequest = SetPuzzleRequestCustom | SetPuzzleRequestRandom;

export interface SetPuzzleResponse {
  date: string;
  word: string;
  teamId?: string;
}

export interface Puzzle {
  date: string;
  word: string;
  teamId?: string;
}

export interface GetPuzzlesParams {
  startDate?: string;
  endDate?: string;
}
