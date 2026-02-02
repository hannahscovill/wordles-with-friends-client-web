const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'https://localhost:8080';

export interface SetPuzzleRequest {
  date: string;
  word: string;
}

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

export const getPuzzles = async (
  token: string,
  params?: GetPuzzlesParams,
): Promise<Puzzle[]> => {
  const searchParams: URLSearchParams = new URLSearchParams();
  if (params?.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params?.endDate) {
    searchParams.set('endDate', params.endDate);
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

  return (await response.json()) as Puzzle[];
};

export const setPuzzle = async (
  token: string,
  data: SetPuzzleRequest,
): Promise<SetPuzzleResponse> => {
  const response: Response = await fetch(`${API_BASE_URL}/puzzle`, {
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

  if (!response.ok) {
    throw new Error(`Failed to set puzzle: ${response.status}`);
  }

  return (await response.json()) as SetPuzzleResponse;
};
