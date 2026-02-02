const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'https://api.wordles.dev';

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

export interface GetPuzzlesResponse {
  puzzles: Puzzle[];
}

export const getPuzzles = async (
  token: string,
  params?: GetPuzzlesParams,
): Promise<Puzzle[]> => {
  const searchParams: URLSearchParams = new URLSearchParams();
  if (params?.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params?.endDate) {
    searchParams.set('end_date', params.endDate);
  }

  const queryString: string = searchParams.toString();
  const url: string = `${API_BASE_URL}/puzzles${queryString ? `?${queryString}` : ''}`;

  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new Error('Unauthorized: Please log in again.');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: You do not have admin privileges.');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch puzzles: ${response.status}`);
  }

  const data: unknown = await response.json();

  // Handle expected response shape: { puzzles: [...] }
  if (
    data !== null &&
    typeof data === 'object' &&
    'puzzles' in data &&
    Array.isArray((data as GetPuzzlesResponse).puzzles)
  ) {
    return (data as GetPuzzlesResponse).puzzles;
  }

  // Handle case where response is directly an array (backwards compatibility)
  if (Array.isArray(data)) {
    return data as Puzzle[];
  }

  // Response is not in expected format
  console.error('Unexpected API response format:', data);
  return [];
};

export const setPuzzle = async (
  token: string,
  data: SetPuzzleRequest,
): Promise<SetPuzzleResponse> => {
  const response: Response = await fetch(`${API_BASE_URL}/puzzles`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error('Unauthorized: Please log in again.');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: You do not have admin privileges.');
  }

  if (response.status === 404) {
    throw new Error('Word not found: The word does not exist in the word list.');
  }

  if (!response.ok) {
    throw new Error(`Failed to set puzzle: ${response.status}`);
  }

  return (await response.json()) as SetPuzzleResponse;
};
