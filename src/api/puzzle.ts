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
