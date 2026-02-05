import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { submitGuess as submitGuessApi, type GameState } from '../api';

interface UseSubmitGuessReturn {
  submit: (guess: string) => Promise<GameState | null>;
  isSubmitting: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useSubmitGuess(puzzleDate: string): UseSubmitGuessReturn {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submit: (guess: string) => Promise<GameState | null> = useCallback(
    async (guess: string): Promise<GameState | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const token: string | undefined = isAuthenticated
          ? await getAccessTokenSilently()
          : undefined;

        return await submitGuessApi(
          { puzzle_date_iso_day: puzzleDate, word_guessed: guess },
          { token },
        );
      } catch (e: unknown) {
        const err: Error = e instanceof Error ? e : new Error(String(e));
        setError(err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [puzzleDate, isAuthenticated, getAccessTokenSilently],
  );

  const clearError: () => void = useCallback((): void => {
    setError(null);
  }, []);

  return { submit, isSubmitting, error, clearError };
}
