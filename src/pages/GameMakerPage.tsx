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
import { Select } from '../components/ui/Select';
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

import type { SelectOption } from '../components/ui/Select';

const PAGE_SIZE_OPTIONS: SelectOption[] = [
  { value: '7', label: '7' },
  { value: '14', label: '14' },
  { value: '30', label: '30' },
  { value: '50', label: '50' },
];

interface DateRange {
  startDate: string;
  endDate: string;
}

const getDateRange = (preset: PresetPeriod): DateRange | null => {
  const today: Date = new Date();
  const endDate: string = today.toISOString().split('T')[0];

  switch (preset) {
    case 'week': {
      const weekAgo: Date = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return { startDate: weekAgo.toISOString().split('T')[0], endDate };
    }
    case 'month': {
      const monthAgo: Date = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return { startDate: monthAgo.toISOString().split('T')[0], endDate };
    }
    case 'year': {
      const yearAgo: Date = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      return { startDate: yearAgo.toISOString().split('T')[0], endDate };
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
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(7);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

  // Puzzle data state
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([]);
  const [isLoadingPuzzles, setIsLoadingPuzzles] = useState<boolean>(false);

  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

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
        setCurrentPage(1);
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

  // Pagination calculations
  const totalPages: number = Math.ceil(allPuzzles.length / pageSize);
  const paginatedPuzzles: Puzzle[] = useMemo(() => {
    const start: number = (currentPage - 1) * pageSize;
    return allPuzzles.slice(start, start + pageSize);
  }, [allPuzzles, currentPage, pageSize]);

  const handlePresetClick = (preset: PresetPeriod): void => {
    setPresetPeriod(preset);
    setCustomStartDate('');
    setCustomEndDate('');
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

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(1);
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

  const renderPagination = (): ReactElement | null => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisiblePages: number = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i: number = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return (
      <div className="gamemaker-page__pagination">
        <button
          type="button"
          className="gamemaker-page__pagination-button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              className={`gamemaker-page__pagination-number ${
                currentPage === page
                  ? 'gamemaker-page__pagination-number--active'
                  : ''
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="gamemaker-page__pagination-ellipsis"
            >
              {page}
            </span>
          ),
        )}
        <button
          type="button"
          className="gamemaker-page__pagination-button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
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
            (preset) => (
              <button
                key={preset}
                type="button"
                className={`gamemaker-page__preset-button ${
                  presetPeriod === preset && !customStartDate && !customEndDate
                    ? 'gamemaker-page__preset-button--active'
                    : ''
                }`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ),
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

      <div className="gamemaker-page__page-size-selector">
        <Select
          label="Show"
          options={PAGE_SIZE_OPTIONS}
          value={String(pageSize)}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        />
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPuzzles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="gamemaker-page__empty">
                    No puzzles found
                  </td>
                </tr>
              ) : (
                paginatedPuzzles.map((puzzle) => (
                  <tr key={puzzle.date}>
                    <td>{puzzle.date}</td>
                    <td>
                      <button
                        type="button"
                        className="gamemaker-page__answer-toggle"
                        onClick={() => toggleAnswerVisibility(puzzle.date)}
                      >
                        {visibleAnswers.has(puzzle.date) ? (
                          puzzle.word
                        ) : (
                          <span className="gamemaker-page__answer-hidden">
                            Click to reveal
                          </span>
                        )}
                      </button>
                    </td>
                    <td>
                      <Button
                        size="s"
                        onClick={() => handleSetAnswerClick(puzzle.date)}
                      >
                        Set Answer
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {renderPagination()}
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
