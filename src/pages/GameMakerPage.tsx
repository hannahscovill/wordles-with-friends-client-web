import {
  useState,
  useEffect,
  useCallback,
  type ReactElement,
  type FormEvent,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import {
  getPuzzles,
  setPuzzle,
  type Puzzle,
  type SetPuzzleResponse,
} from '../api/puzzle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NotFoundPage } from './NotFoundPage';
import './GameMakerPage.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

interface WeekDay {
  date: string;
  displayDate: string;
  dayName: string;
  puzzle?: Puzzle;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const getWeekDates = (weekStart: Date): Date[] => {
  const dates: Date[] = [];
  for (let i: number = 0; i < 7; i++) {
    const date: Date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const getStartOfWeek = (date: Date): Date => {
  const d: Date = new Date(date);
  const day: number = d.getDay();
  const diff: number = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const GameMakerPage = (): ReactElement => {
  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [authTokens] = useLocalStorage<AuthTokens>('auth_tokens');
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getStartOfWeek(new Date()),
  );
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [isLoadingPuzzles, setIsLoadingPuzzles] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  // Modal state for setting a puzzle
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [word, setWord] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Check if user has game_admin privilege in app_metadata
  const appMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.['wordles.dev/app_metadata'] as Record<string, unknown> | undefined;
  const isGameAdmin: boolean = appMetadata?.game_admin === true;

  const loadWeekPuzzles: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      setIsLoadingPuzzles(true);
      setLoadError('');

      try {
        const token: string = await getAccessTokenSilently();
        const weekDates: Date[] = getWeekDates(weekStart);
        const startDate: string = formatDate(weekDates[0]);
        const endDate: string = formatDate(weekDates[6]);

        const puzzles: Puzzle[] = await getPuzzles(token, {
          start_date: startDate,
          end_date: endDate,
        });

        // Create a map of date -> puzzle
        const puzzleMap: Map<string, Puzzle> = new Map<string, Puzzle>();
        puzzles.forEach((puzzle) => {
          puzzleMap.set(puzzle.date, puzzle);
        });

        // Build week days array
        const days: WeekDay[] = weekDates.map((date) => {
          const dateStr: string = formatDate(date);
          return {
            date: dateStr,
            displayDate: formatDisplayDate(date),
            dayName: getDayName(date),
            puzzle: puzzleMap.get(dateStr),
          };
        });

        setWeekDays(days);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load puzzles',
        );
      } finally {
        setIsLoadingPuzzles(false);
      }
    }, [getAccessTokenSilently, weekStart]);

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

  // Load puzzles when authenticated and week changes
  useEffect(() => {
    if (isAuthenticated && isGameAdmin) {
      loadWeekPuzzles();
    }
  }, [isAuthenticated, isGameAdmin, loadWeekPuzzles]);

  const navigateWeek = (direction: 'prev' | 'next'): void => {
    setWeekStart((prev) => {
      const newDate: Date = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const validateWord = (value: string): string | undefined => {
    if (value.length !== 5) {
      return 'Word must be exactly 5 letters';
    }
    if (!/^[a-zA-Z]+$/.test(value)) {
      return 'Word must contain only letters';
    }
    return undefined;
  };

  const handleSetAnswer = (date: string): void => {
    setEditingDate(date);
    setWord('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCloseModal = (): void => {
    setEditingDate(null);
    setWord('');
    setErrorMessage('');
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

    if (!editingDate) {
      setErrorMessage('No date selected');
      return;
    }

    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();
      const response: SetPuzzleResponse = await setPuzzle(token, {
        date: editingDate,
        word: word.toUpperCase(),
      });
      setSuccessMessage(`Puzzle set for ${response.date}: ${response.word}`);
      setWord('');
      setEditingDate(null);
      // Reload the week data
      await loadWeekPuzzles();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to set puzzle',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getWeekLabel = (): string => {
    const weekDates: Date[] = getWeekDates(weekStart);
    const start: string = formatDisplayDate(weekDates[0]);
    const end: string = formatDisplayDate(weekDates[6]);
    return `${start} - ${end}`;
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

  // Show 404 for non-admin users
  if (!isGameAdmin) {
    return <NotFoundPage />;
  }

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Game Maker</h2>

      {successMessage && (
        <div className="gamemaker-page__success">{successMessage}</div>
      )}

      <div className="gamemaker-page__week-nav">
        <Button size="s" onClick={() => navigateWeek('prev')}>
          Previous
        </Button>
        <span className="gamemaker-page__week-label">{getWeekLabel()}</span>
        <Button size="s" onClick={() => navigateWeek('next')}>
          Next
        </Button>
      </div>

      {isLoadingPuzzles ? (
        <div className="gamemaker-page__loading">
          <Spinner size="medium" label="Loading puzzles" />
        </div>
      ) : loadError ? (
        <div className="gamemaker-page__error">{loadError}</div>
      ) : (
        <div className="gamemaker-page__week-table">
          <div className="gamemaker-page__week-header">
            <span>Day</span>
            <span>Date</span>
            <span>Answer</span>
          </div>
          {weekDays.map((day) => (
            <div key={day.date} className="gamemaker-page__week-row">
              <span className="gamemaker-page__day-name">{day.dayName}</span>
              <span className="gamemaker-page__date">{day.displayDate}</span>
              <span className="gamemaker-page__answer">
                {day.puzzle ? (
                  <span className="gamemaker-page__word">
                    {day.puzzle.word}
                  </span>
                ) : (
                  <Button size="s" onClick={() => handleSetAnswer(day.date)}>
                    Set Answer
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {editingDate && (
        <Modal>
          <div className="gamemaker-page__modal">
            <h3 className="gamemaker-page__modal-title">
              Set Answer for {editingDate}
            </h3>
            <form className="gamemaker-page__form" onSubmit={handleSubmit}>
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
              {errorMessage && (
                <div className="gamemaker-page__error">{errorMessage}</div>
              )}
              <div className="gamemaker-page__modal-actions">
                <Button
                  type="button"
                  size="s"
                  variant="onLight"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="s"
                  variant="onLight"
                  disabled={isSaving}
                >
                  {isSaving ? 'Setting...' : 'Set Answer'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
