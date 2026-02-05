import type { AxiosResponse } from 'axios';
import { apiClient, authHeaders } from './client';
import { ApiError } from './errors';
import { ensureSessionCookie, getSessionCookie } from './session';
import type {
  GuessRequest,
  GameState,
  GradedMove,
  GradedLetter,
  LetterGrade,
  SubmitGuessOptions,
  GetGameProgressOptions,
  HistoryEntry,
  HistoryResponse,
  GameRecord,
  UserProfile,
  UpdateProfileRequest,
  UploadAvatarResponse,
  GetPuzzlesParams,
  Puzzle,
  SetPuzzleRequest,
  SetPuzzleResponse,
} from './types';

// ── Helpers ─────────────────────────────────────────────────────────

/** Extract a user-facing message from a scorekeeper API error response. */
function extractUserMessage(error: ApiError): string {
  if (!error.responseBody) {
    return error.message;
  }

  try {
    const body: Record<string, unknown> = JSON.parse(
      error.responseBody,
    ) as Record<string, unknown>;

    // { error: "message" }
    if (typeof body.error === 'string') {
      return body.error;
    }
    // { error: { message: "message" } }
    if (
      body.error !== null &&
      typeof body.error === 'object' &&
      typeof (body.error as Record<string, unknown>).message === 'string'
    ) {
      return (body.error as Record<string, unknown>).message as string;
    }
    // { message: "message" }
    if (typeof body.message === 'string') {
      return body.message;
    }
    // { detail: "message" }
    if (typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    // Not JSON — use the raw body if it looks like a short readable message
    if (error.responseBody.length > 0 && error.responseBody.length < 500) {
      return error.responseBody;
    }
  }

  return error.message;
}

// ── Guess / Game ────────────────────────────────────────────────────

export const submitGuess = async (
  data: GuessRequest,
  options: SubmitGuessOptions = {},
): Promise<GameState> => {
  const { token } = options;

  if (!token) {
    ensureSessionCookie();
  }

  try {
    const response: AxiosResponse<GameState> = await apiClient.post<GameState>(
      '/guess',
      data,
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      throw new Error(extractUserMessage(e));
    }
    // CORS or network error — provide a helpful message instead of raw
    // "Network Error" / "Failed to fetch" which is meaningless to users.
    throw new Error(
      'Unable to reach the server. Please check your connection and try again.',
    );
  }
};

export const getGameProgress = async (
  puzzleDateIsoDay: string,
  options: GetGameProgressOptions = {},
): Promise<GameState | null> => {
  const { token } = options;

  if (!token) {
    const sessionId: string | null = getSessionCookie();
    if (!sessionId) {
      return null;
    }
  }

  try {
    const response: AxiosResponse<GameState> = await apiClient.get<GameState>(
      `/game/${puzzleDateIsoDay}`,
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
};

/**
 * Checks if a puzzle exists for the given date.
 * This is a lightweight check that doesn't require authentication.
 * Used by route loaders to validate dates before rendering.
 */
export const checkPuzzleExists = async (
  puzzleDateIsoDay: string,
): Promise<boolean> => {
  try {
    await apiClient.get(`/game/${puzzleDateIsoDay}`);
    return true;
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) {
      return false;
    }
    // For other errors, assume puzzle might exist (don't block navigation)
    return true;
  }
};

// ── History ─────────────────────────────────────────────────────────

function convertGradesToGuesses(
  gradedGuesses: LetterGrade[][] | undefined,
): GradedMove[] | undefined {
  if (!gradedGuesses || gradedGuesses.length === 0) {
    return undefined;
  }

  return gradedGuesses.map((row: LetterGrade[]): GradedMove => {
    return row.map(
      (grade: LetterGrade): GradedLetter => ({
        letter: '', // Letter not needed for MiniGameBoard display
        grade,
      }),
    ) as GradedMove;
  });
}

interface HistoryApiResponse {
  games: GameRecord[];
  total_games: number;
  games_won: number;
}

export const getHistory = async (token: string): Promise<HistoryResponse> => {
  const response: AxiosResponse<HistoryApiResponse> =
    await apiClient.get<HistoryApiResponse>('/history', {
      headers: authHeaders(token),
    });

  const apiResponse: HistoryApiResponse = response.data;

  const entries: HistoryEntry[] = apiResponse.games.map(
    (game: GameRecord): HistoryEntry => {
      if (game.in_progress) {
        return {
          puzzle_date: game.puzzle_date,
          played: false,
          in_progress: true,
          guesses: convertGradesToGuesses(game.graded_guesses),
          guess_count: game.guesses_count,
        };
      }
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

// ── Profile ─────────────────────────────────────────────────────────

export const getUserProfile = async (
  token: string,
): Promise<UserProfile | null> => {
  try {
    const response: AxiosResponse<UserProfile> =
      await apiClient.get<UserProfile>('/profile', {
        headers: authHeaders(token),
      });
    return response.data;
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    console.error('Error fetching profile:', e);
    return null;
  }
};

export const updateUserProfile = async (
  token: string,
  data: UpdateProfileRequest,
): Promise<UserProfile> => {
  const response: AxiosResponse<UserProfile> = await apiClient.put<UserProfile>(
    '/profile',
    data,
    {
      headers: authHeaders(token),
    },
  );
  return response.data;
};

export const uploadAvatar = async (
  token: string,
  file: File,
): Promise<UploadAvatarResponse> => {
  const MAX_FILE_SIZE: number = 2 * 1024 * 1024; // 2MB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be less than 2MB.');
  }

  const formData: FormData = new FormData();
  formData.append('avatar', file);

  const response: AxiosResponse<UploadAvatarResponse> =
    await apiClient.post<UploadAvatarResponse>('/profile/avatar', formData, {
      headers: authHeaders(token),
    });
  return response.data;
};

// ── Puzzles (admin) ─────────────────────────────────────────────────

interface GetPuzzlesResponse {
  puzzles: Puzzle[];
}

export const getPuzzles = async (
  token: string,
  params?: GetPuzzlesParams,
): Promise<Puzzle[]> => {
  const searchParams: Record<string, string> = {};
  if (params?.startDate) {
    searchParams['start_date'] = params.startDate;
  }
  if (params?.endDate) {
    searchParams['end_date'] = params.endDate;
  }

  try {
    const response: AxiosResponse<GetPuzzlesResponse | Puzzle[]> =
      await apiClient.get<GetPuzzlesResponse | Puzzle[]>('/puzzles', {
        headers: authHeaders(token),
        params: searchParams,
      });

    const data: GetPuzzlesResponse | Puzzle[] = response.data;

    // Handle expected response shape: { puzzles: [...] }
    if (
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      'puzzles' in data &&
      Array.isArray(data.puzzles)
    ) {
      return data.puzzles;
    }

    // Handle case where response is directly an array (backwards compatibility)
    if (Array.isArray(data)) {
      return data;
    }

    console.error('Unexpected API response format:', data);
    return [];
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }
      if (e.status === 403) {
        throw new Error('Forbidden: You do not have admin privileges.');
      }
    }
    throw e;
  }
};

export const setPuzzle = async (
  token: string,
  data: SetPuzzleRequest,
): Promise<SetPuzzleResponse> => {
  try {
    const response: AxiosResponse<SetPuzzleResponse> =
      await apiClient.put<SetPuzzleResponse>('/puzzles', data, {
        headers: authHeaders(token),
      });
    return response.data;
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }
      if (e.status === 403) {
        throw new Error('Forbidden: You do not have admin privileges.');
      }
      if (e.status === 404) {
        throw new Error(
          'Word not found: The word does not exist in the word list.',
        );
      }
    }
    throw e;
  }
};
