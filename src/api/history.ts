import type { GradedMove } from './guess';

const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';

export interface HistoryEntry {
  puzzle_date: string;
  played: boolean;
  won?: boolean;
  guesses?: GradedMove[];
  guess_count?: number;
}

export interface HistoryResponse {
  entries: HistoryEntry[];
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

  return (await response.json()) as HistoryResponse;
};
