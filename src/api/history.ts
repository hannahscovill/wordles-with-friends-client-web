import type { GradedMove, GradedLetter } from './guess';

const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';

// API response types from backend - matches actual API format
type GradeString = 'correct' | 'contained' | 'wrong';

interface GameRecord {
  game_id: string;
  puzzle_date: string;
  guesses_count: number;
  won: boolean;
  in_progress: boolean;
  graded_guesses?: GradeString[][];
  created_at: string;
  updated_at: string;
}

interface HistoryApiResponse {
  games: GameRecord[];
  total_games: number;
  games_won: number;
}

// Convert API grade format to frontend format
function convertGradesToGuesses(
  gradedGuesses: GradeString[][] | undefined,
): GradedMove[] | undefined {
  if (!gradedGuesses || gradedGuesses.length === 0) {
    return undefined;
  }

  return gradedGuesses.map((row: GradeString[]): GradedMove => {
    return row.map(
      (grade: GradeString): GradedLetter => ({
        letter: '', // Letter not needed for MiniGameBoard display
        grade,
      }),
    ) as GradedMove;
  });
}

// Client-side types for display
export interface HistoryEntry {
  puzzle_date: string;
  played: boolean;
  won?: boolean;
  guesses?: GradedMove[];
  guess_count?: number;
  in_progress?: boolean;
}

export interface HistoryResponse {
  entries: HistoryEntry[];
  total_games: number;
  games_won: number;
}

function getLast7Days(): string[] {
  const dates: string[] = [];
  const today: Date = new Date();

  for (let i: number = 0; i < 7; i++) {
    const date: Date = new Date(today);
    date.setDate(today.getDate() - i);
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export const getHistory = async (token: string): Promise<HistoryResponse> => {
  const response: Response = await fetch(`${API_BASE_URL}/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }

  const apiResponse: HistoryApiResponse =
    (await response.json()) as HistoryApiResponse;

  // Create a map of played games by date
  const gamesByDate: Map<string, GameRecord> = new Map();
  for (const game of apiResponse.games) {
    gamesByDate.set(game.puzzle_date, game);
  }

  // Build entries for the last 7 days
  const last7Days: string[] = getLast7Days();
  const entries: HistoryEntry[] = last7Days.map((date: string) => {
    const game: GameRecord | undefined = gamesByDate.get(date);
    if (game) {
      if (game.in_progress) {
        // In-progress game - show progress with continue button
        return {
          puzzle_date: date,
          played: false,
          in_progress: true,
          guesses: convertGradesToGuesses(game.graded_guesses),
          guess_count: game.guesses_count,
        };
      }
      // Completed game
      return {
        puzzle_date: date,
        played: true,
        won: game.won,
        guesses: convertGradesToGuesses(game.graded_guesses),
        guess_count: game.guesses_count,
      };
    }
    return {
      puzzle_date: date,
      played: false,
    };
  });

  return {
    entries,
    total_games: apiResponse.total_games,
    games_won: apiResponse.games_won,
  };
};
