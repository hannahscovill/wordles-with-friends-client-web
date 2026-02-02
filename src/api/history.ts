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

  // Convert all games from API to history entries
  const entries: HistoryEntry[] = apiResponse.games.map(
    (game: GameRecord): HistoryEntry => {
      if (game.in_progress) {
        // In-progress game - show progress with continue button
        return {
          puzzle_date: game.puzzle_date,
          played: false,
          in_progress: true,
          guesses: convertGradesToGuesses(game.graded_guesses),
          guess_count: game.guesses_count,
        };
      }
      // Completed game
      return {
        puzzle_date: game.puzzle_date,
        played: true,
        won: game.won,
        guesses: convertGradesToGuesses(game.graded_guesses),
        guess_count: game.guesses_count,
      };
    },
  );

  return {
    entries,
    total_games: apiResponse.total_games,
    games_won: apiResponse.games_won,
  };
};
