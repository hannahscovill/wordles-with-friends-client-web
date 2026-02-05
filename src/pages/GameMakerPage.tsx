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
import { DateFilter } from '../components/DateFilter';
import {
  setPuzzle,
  getPuzzles,
  type SetPuzzleResponse,
  type Puzzle,
  type SetPuzzleRequestCustom,
  type SetPuzzleRequestRandom,
} from '../api';
import { NotFoundPage } from './NotFoundPage';
import {
  type PresetPeriod,
  type DateRange,
  generateDatesInRange,
  getDateRange,
  navigateDateRange,
} from '../utils/dates';
import './GameMakerPage.scss';

export const GameMakerPage = (): ReactElement => {
  // Router protects this route - we trust we're authenticated if rendering
  const { user, getAccessTokenSilently } = useAuth0();

  // Form state for setting puzzles
  const [modalDate, setModalDate] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingRandomDate, setSavingRandomDate] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Filter and pagination state
  const [presetPeriod, setPresetPeriod] = useState<PresetPeriod>('week');
  const initialRange: { startDate: string; endDate: string } | null =
    getDateRange('week');
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

  // Check if we should skip date generation (All or Year mode)
  // Year mode has too many dates (365) so we treat it like All mode
  const isAllSelected: boolean = !customStartDate && !customEndDate;
  const skipDateGeneration: boolean = isAllSelected || presetPeriod === 'year';

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
    }, [getAccessTokenSilently, activeDateRange]);

  useEffect(() => {
    if (isGameAdmin) {
      fetchPuzzles();
    }
  }, [isGameAdmin, fetchPuzzles]);

  // Compute display rows: merge all dates in range with API puzzles (except for All/Year mode)
  const displayRows: Puzzle[] = useMemo(() => {
    // For "All" or "Year" mode, just show puzzles from API (no date generation)
    if (skipDateGeneration) {
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
  }, [skipDateGeneration, customStartDate, customEndDate, allPuzzles]);

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
      const request: SetPuzzleRequestCustom = {
        date: modalDate,
        word: word.toUpperCase(),
      };
      const response: SetPuzzleResponse = await setPuzzle(token, request);
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

  const handleSetRandomClick = async (date: string): Promise<void> => {
    setSuccessMessage('');
    setErrorMessage('');
    setSavingRandomDate(date);

    try {
      const token: string = await getAccessTokenSilently();
      const request: SetPuzzleRequestRandom = {
        date,
        set_random_unused_word: true,
      };
      const response: SetPuzzleResponse = await setPuzzle(token, request);
      setSuccessMessage(`Random puzzle set for ${response.date}`);
      fetchPuzzles();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to set random puzzle',
      );
    } finally {
      setSavingRandomDate(null);
    }
  };

  // Wait for user data to determine role (router handles auth)
  if (!user) {
    return (
      <div className="gamemaker-page">
        <div className="gamemaker-page__loading">
          <Spinner size="large" label="Loading" />
        </div>
      </div>
    );
  }

  // Show 404 for non-admin users (role-based access check)
  if (!isGameAdmin) {
    return <NotFoundPage />;
  }

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Gamemaker</h2>

      <DateFilter
        presetPeriod={presetPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onPresetChange={setPresetPeriod}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        showNavigation={false}
      />

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
                        <div className="gamemaker-page__button-group">
                          <button
                            type="button"
                            className="gamemaker-page__set-answer-btn"
                            onClick={() => handleSetAnswerClick(puzzle.date)}
                            disabled={savingRandomDate === puzzle.date}
                          >
                            Custom
                          </button>
                          <button
                            type="button"
                            className="gamemaker-page__set-answer-btn"
                            onClick={() => handleSetRandomClick(puzzle.date)}
                            disabled={savingRandomDate === puzzle.date}
                          >
                            {savingRandomDate === puzzle.date
                              ? 'Setting...'
                              : 'Random'}
                          </button>
                        </div>
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
              onClick={() => {
                const newRange: DateRange | null = navigateDateRange(
                  presetPeriod,
                  customStartDate,
                  'prev',
                );
                if (newRange) {
                  setCustomStartDate(newRange.startDate);
                  setCustomEndDate(newRange.endDate);
                }
              }}
              disabled={presetPeriod === 'all'}
            >
              Previous
            </button>
            <button
              type="button"
              className="gamemaker-page__nav-button"
              onClick={() => {
                const newRange: DateRange | null = navigateDateRange(
                  presetPeriod,
                  customStartDate,
                  'next',
                );
                if (newRange) {
                  setCustomStartDate(newRange.startDate);
                  setCustomEndDate(newRange.endDate);
                }
              }}
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
                onChange={(e) => {
                  setWord(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                maxLength={5}
                pattern="[A-Za-z]{5}"
                placeholder="WORD"
                fullWidth
                required
                error={
                  word.length > 0 && word.length !== 5
                    ? 'Must be 5 letters'
                    : errorMessage.length > 0
                      ? errorMessage
                      : undefined
                }
              />
              <div className="gamemaker-page__modal-actions">
                <Button
                  size="s"
                  variant="onLight"
                  onClick={() => {
                    setShowModal(false);
                    setErrorMessage('');
                  }}
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
