const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'https://localhost:8080';

export interface Puzzle {
  date: string;
  word: string;
  teamId?: string;
}

export interface GetPuzzlesParams {
  start_date?: string;
  end_date?: string;
  omit_answers?: boolean;
}

export interface SetPuzzleRequest {
  date: string;
  word: string;
}

export interface SetPuzzleResponse {
  date: string;
  word: string;
  teamId?: string;
}

export const getPuzzles = async (
  token: string,
  params: GetPuzzlesParams = {},
): Promise<Puzzle[]> => {
  const queryParams: URLSearchParams = new URLSearchParams();
  if (params.start_date) queryParams.set('start_date', params.start_date);
  if (params.end_date) queryParams.set('end_date', params.end_date);
  if (params.omit_answers !== undefined) {
    queryParams.set('omit_answers', String(params.omit_answers));
  }

  const queryString: string = queryParams.toString();
  const url: string = `${API_BASE_URL}/puzzle${queryString ? `?${queryString}` : ''}`;

  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
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
