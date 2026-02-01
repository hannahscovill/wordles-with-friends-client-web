import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { setPuzzle, type SetPuzzleResponse } from '../api/puzzle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './GameMakerPage.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

export const GameMakerPage = (): ReactElement => {
  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [authTokens] = useLocalStorage<AuthTokens>('auth_tokens');
  const [date, setDate] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Check if user has game_admin privilege
  const userMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.user_metadata as Record<string, unknown> | undefined;
  const isGameAdmin: boolean = userMetadata?.game_admin === true;

  // Start login flow if not authenticated
  useEffect(() => {
    if (!hasStoredTokens && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/gamemaker' },
      });
    } else if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/gamemaker' },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, hasStoredTokens]);

  const validateWord = (value: string): string | undefined => {
    if (value.length !== 5) {
      return 'Word must be exactly 5 letters';
    }
    if (!/^[a-zA-Z]+$/.test(value)) {
      return 'Word must contain only letters';
    }
    return undefined;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const wordError: string | undefined = validateWord(word);
    if (wordError) {
      setErrorMessage(wordError);
      return;
    }

    if (!date) {
      setErrorMessage('Please select a date');
      return;
    }

    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();
      const response: SetPuzzleResponse = await setPuzzle(token, {
        date,
        word: word.toUpperCase(),
      });
      setSuccessMessage(`Puzzle set for ${response.date}: ${response.word}`);
      setWord('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to set puzzle',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking auth
  if (!hasStoredTokens && !isAuthenticated) {
    return (
      <div className="gamemaker-page">
        <div className="gamemaker-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="gamemaker-page">
        <div className="gamemaker-page__loading">
          <Spinner size="large" label="Loading" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="gamemaker-page">
        <div className="gamemaker-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  // Check for admin privileges after auth is confirmed
  if (!isGameAdmin) {
    return (
      <div className="gamemaker-page">
        <div className="gamemaker-page__error">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Game Maker</h2>
      <form className="gamemaker-page__form" onSubmit={handleSubmit}>
        <Input
          label="Puzzle Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
        />
        <Input
          label="5-Letter Word"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase())}
          maxLength={5}
          pattern="[A-Za-z]{5}"
          placeholder="WORD"
          fullWidth
          required
          error={
            word.length > 0 && word.length !== 5
              ? 'Must be 5 letters'
              : undefined
          }
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Setting...' : 'Set Game'}
        </Button>
      </form>
      {successMessage && (
        <div className="gamemaker-page__success">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="gamemaker-page__error">{errorMessage}</div>
      )}
    </div>
  );
};
