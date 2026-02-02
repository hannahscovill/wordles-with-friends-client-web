import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactElement,
  type FormEvent,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import {
  setPuzzle,
  getPuzzles,
  type SetPuzzleResponse,
  type Puzzle,
} from '../api/puzzle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NotFoundPage } from './NotFoundPage';
import './GameMakerPage.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

type PresetPeriod = 'week' | 'month' | 'year' | 'all';

interface DateRange {
  startDate: string;
  endDate: string;
}

const formatLocalDate = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateDatesInRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current: Date = new Date(startDate + 'T00:00:00');
  const end: Date = new Date(endDate + 'T00:00:00');

  while (current <= end) {
    dates.push(formatLocalDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const getDateRange = (preset: PresetPeriod): DateRange | null => {
  const today: Date = new Date();

  switch (preset) {
    case 'week': {
      // Sunday to Saturday of current week
      const dayOfWeek: number = today.getDay();
      const sunday: Date = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      const saturday: Date = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return {
        startDate: formatLocalDate(sunday),
        endDate: formatLocalDate(saturday),
      };
    }
    case 'month': {
      // First to last day of current month
      const firstOfMonth: Date = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const lastOfMonth: Date = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      );
      return {
        startDate: formatLocalDate(firstOfMonth),
        endDate: formatLocalDate(lastOfMonth),
      };
    }
    case 'year': {
      // First to last day of current year
      const firstOfYear: Date = new Date(today.getFullYear(), 0, 1);
      const lastOfYear: Date = new Date(today.getFullYear(), 11, 31);
      return {
        startDate: formatLocalDate(firstOfYear),
        endDate: formatLocalDate(lastOfYear),
      };
    }
    case 'all':
      return null;
  }
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

  // Form state for setting puzzles
  const [modalDate, setModalDate] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Filter and pagination state
  const [presetPeriod, setPresetPeriod] = useState<PresetPeriod>('week');
  const initialRange: DateRange | null = getDateRange('week');
  const [customStartDate, setCustomStartDate] = useState<string>(
    initialRange?.startDate ?? '',
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    initialRange?.endDate ?? '',
  );
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

  // Puzzle data state
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([]);
  const [isLoadingPuzzles, setIsLoadingPuzzles] = useState<boolean>(false);

  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Check if "All" is selected (no date range)
  const isAllSelected: boolean = !customStartDate && !customEndDate;

  // Check if user has game_admin privilege in app_metadata
  const appMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.['wordles.dev/app_metadata'] as Record<string, unknown> | undefined;
  const isGameAdmin: boolean = appMetadata?.game_admin === true;

  // Determine active date range (custom overrides preset)
  const activeDateRange: { startDate?: string; endDate?: string } | undefined =
    useMemo(() => {
      if (customStartDate || customEndDate) {
        return {
          startDate: customStartDate || undefined,
          endDate: customEndDate || undefined,
        };
      }
      return getDateRange(presetPeriod) ?? undefined;
    }, [presetPeriod, customStartDate, customEndDate]);

  // Fetch puzzles when date range changes
  const fetchPuzzles: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      if (!isAuthenticated) return;

      setIsLoadingPuzzles(true);
      try {
        const token: string = await getAccessTokenSilently();
        const puzzles: Puzzle[] = await getPuzzles(
          token,
          activeDateRange ?? undefined,
        );
        setAllPuzzles(puzzles);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to fetch puzzles',
        );
      } finally {
        setIsLoadingPuzzles(false);
      }
    }, [isAuthenticated, getAccessTokenSilently, activeDateRange]);

  useEffect(() => {
    if (isAuthenticated && isGameAdmin) {
      fetchPuzzles();
    }
  }, [isAuthenticated, isGameAdmin, fetchPuzzles]);

  // Compute display rows: merge all dates in range with API puzzles (except for "All" mode)
  const displayRows: Puzzle[] = useMemo(() => {
    // For "All" mode, just show puzzles from API
    if (isAllSelected) {
      return allPuzzles;
    }

    // If we don't have both start and end dates, just show API puzzles
    if (!customStartDate || !customEndDate) {
      return allPuzzles;
    }

    // Generate all dates in the range
    const allDatesInRange: string[] = generateDatesInRange(
      customStartDate,
      customEndDate,
    );

    // Create a map of existing puzzles by date
    const puzzlesByDate: Map<string, Puzzle> = new Map<string, Puzzle>(
      allPuzzles.map((puzzle) => [puzzle.date, puzzle]),
    );

    // Merge: for each date, use existing puzzle or create empty entry
    return allDatesInRange.map((date) => {
      const existingPuzzle: Puzzle | undefined = puzzlesByDate.get(date);
      if (existingPuzzle) {
        return existingPuzzle;
      }
      // Create empty puzzle entry for date without a puzzle
      return { date, word: '' };
    });
  }, [isAllSelected, customStartDate, customEndDate, allPuzzles]);

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

  const handlePresetClick = (preset: PresetPeriod): void => {
    setPresetPeriod(preset);
    const range: DateRange | null = getDateRange(preset);
    if (range) {
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
    } else {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleCustomDateChange = (
    field: 'start' | 'end',
    value: string,
  ): void => {
    if (field === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next'): void => {
    if (presetPeriod === 'all' || !customStartDate) return;

    const currentStart: Date = new Date(customStartDate + 'T00:00:00');
    const offset: number = direction === 'prev' ? -1 : 1;

    let newStart: Date;
    let newEnd: Date;

    switch (presetPeriod) {
      case 'week': {
        newStart = new Date(currentStart);
        newStart.setDate(currentStart.getDate() + offset * 7);
        newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 6);
        break;
      }
      case 'month': {
        newStart = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth() + offset,
          1,
        );
        newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
        break;
      }
      case 'year': {
        newStart = new Date(currentStart.getFullYear() + offset, 0, 1);
        newEnd = new Date(currentStart.getFullYear() + offset, 11, 31);
        break;
      }
      default:
        return;
    }

    setCustomStartDate(formatLocalDate(newStart));
    setCustomEndDate(formatLocalDate(newEnd));
  };

  const toggleAnswerVisibility = (date: string): void => {
    setVisibleAnswers((prev: Set<string>) => {
      const newSet: Set<string> = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleSetAnswerClick = (date: string): void => {
    setModalDate(date);
    setWord('');
    setShowModal(true);
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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const wordError: string | undefined = validateWord(word);
    if (wordError) {
      setErrorMessage(wordError);
      return;
    }

    if (!modalDate) {
      setErrorMessage('Please select a date');
      return;
    }

    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();
      const response: SetPuzzleResponse = await setPuzzle(token, {
        date: modalDate,
        word: word.toUpperCase(),
      });
      setSuccessMessage(`Puzzle set for ${response.date}: ${response.word}`);
      setWord('');
      setShowModal(false);
      // Refresh the puzzle list
      fetchPuzzles();
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

  // Show 404 for non-admin users
  if (!isGameAdmin) {
    return <NotFoundPage />;
  }

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Gamemaker</h2>

      <div className="gamemaker-page__filter-section">
        <div className="gamemaker-page__preset-buttons">
          {(['week', 'month', 'year', 'all'] as PresetPeriod[]).map(
            (preset) => {
              const presetRange: DateRange | null = getDateRange(preset);
              const isActive: boolean =
                preset === 'all'
                  ? !customStartDate && !customEndDate
                  : presetRange?.startDate === customStartDate &&
                    presetRange?.endDate === customEndDate;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`gamemaker-page__preset-button ${
                    isActive ? 'gamemaker-page__preset-button--active' : ''
                  }`}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              );
            },
          )}
        </div>
        <div className="gamemaker-page__date-pickers">
          <Input
            label="From"
            type="date"
            value={customStartDate}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={customEndDate}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
          />
        </div>
      </div>

      {isLoadingPuzzles ? (
        <div className="gamemaker-page__loading">
          <Spinner size="medium" label="Loading puzzles" />
        </div>
      ) : (
        <>
          <table className="gamemaker-page__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="gamemaker-page__empty">
                    No puzzles found
                  </td>
                </tr>
              ) : (
                displayRows.map((puzzle) => (
                  <tr key={puzzle.date}>
                    <td>{puzzle.date}</td>
                    <td>
                      {puzzle.word ? (
                        <button
                          type="button"
                          className="gamemaker-page__answer-toggle"
                          onClick={() => toggleAnswerVisibility(puzzle.date)}
                        >
                          {visibleAnswers.has(puzzle.date)
                            ? puzzle.word
                            : '* * * * *'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="gamemaker-page__set-answer-btn"
                          onClick={() => handleSetAnswerClick(puzzle.date)}
                        >
                          Set Game
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="gamemaker-page__navigation">
            <button
              type="button"
              className="gamemaker-page__nav-button"
              onClick={() => handleNavigate('prev')}
              disabled={presetPeriod === 'all'}
            >
              Previous
            </button>
            <button
              type="button"
              className="gamemaker-page__nav-button"
              onClick={() => handleNavigate('next')}
              disabled={presetPeriod === 'all'}
            >
              Next
            </button>
          </div>
        </>
      )}

      {successMessage && (
        <div className="gamemaker-page__success">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="gamemaker-page__error">{errorMessage}</div>
      )}

      {showModal && (
        <div
          className="gamemaker-page__modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="gamemaker-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="gamemaker-page__modal-title">
              Set Answer for {modalDate}
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
              <div className="gamemaker-page__modal-actions">
                <Button
                  size="s"
                  variant="onLight"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="s"
                  variant="onLight"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? 'Setting...' : 'Set'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
