import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactElement,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  getHistory,
  getPuzzles,
  type HistoryEntry,
  type HistoryResponse,
  type Puzzle,
} from '../api';
import { MiniGameBoard } from '../components/MiniGameBoard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { DateFilter } from '../components/DateFilter';
import {
  type PresetPeriod,
  type DateRange,
  formatDateForDisplay,
  getTodayLocalDate,
  getDateRange,
  navigateDateRange,
} from '../utils/dates';
import './ScoreHistoryPage.scss';

export const ScoreHistoryPage = (): ReactElement => {
  // Router protects this route - we trust we're authenticated if rendering
  const { getAccessTokenSilently } = useAuth0();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [availablePuzzles, setAvailablePuzzles] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter state
  const [presetPeriod, setPresetPeriod] = useState<PresetPeriod>('week');
  const initialRange: { startDate: string; endDate: string } | null =
    getDateRange('week');
  const [customStartDate, setCustomStartDate] = useState<string>(
    initialRange?.startDate ?? '',
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    initialRange?.endDate ?? '',
  );

  // Check if we should skip date generation (All or Year mode)
  const isAllSelected: boolean = !customStartDate && !customEndDate;
  const skipDateGeneration: boolean = isAllSelected || presetPeriod === 'year';

  // Fetch history and available puzzles
  const fetchHistory: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      setIsLoadingHistory(true);
      try {
        const token: string = await getAccessTokenSilently();
        const [historyResponse, puzzles]: [HistoryResponse, Puzzle[]] =
          await Promise.all([getHistory(token), getPuzzles(token)]);
        setHistoryData(historyResponse.entries);
        setAvailablePuzzles(new Set(puzzles.map((p: Puzzle) => p.date)));
        setError(null);
      } catch (e: unknown) {
        const err: Error = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setHistoryData([]);
        setAvailablePuzzles(new Set());
      } finally {
        setIsLoadingHistory(false);
      }
    }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Compute display rows: merge history with available puzzles
  // Shows all dates from history AND available puzzles
  const displayRows: HistoryEntry[] = useMemo(() => {
    // Create a map of history by date for quick lookup
    const historyByDate: Map<string, HistoryEntry> = new Map(
      historyData.map((entry) => [entry.puzzle_date, entry]),
    );

    // Get all unique dates from both history and available puzzles
    const allDates: Set<string> = new Set([
      ...historyData.map((entry) => entry.puzzle_date),
      ...availablePuzzles,
    ]);

    // Convert to sorted array (newest first)
    const sortedDates: string[] = Array.from(allDates).sort((a, b) =>
      b.localeCompare(a),
    );

    // Helper to create entry for a date
    const createEntry = (date: string): HistoryEntry => {
      const existingEntry: HistoryEntry | undefined = historyByDate.get(date);
      if (existingEntry) {
        return existingEntry;
      }
      return { puzzle_date: date, played: false };
    };

    // For "All" mode, show all dates
    if (isAllSelected) {
      return sortedDates.map(createEntry);
    }

    // For "Year" mode, filter by date range
    if (skipDateGeneration) {
      return sortedDates
        .filter((date) => {
          if (!customStartDate && !customEndDate) return true;
          if (customStartDate && date < customStartDate) return false;
          if (customEndDate && date > customEndDate) return false;
          return true;
        })
        .map(createEntry);
    }

    // If we don't have both start and end dates, show all dates
    if (!customStartDate || !customEndDate) {
      return sortedDates.map(createEntry);
    }

    // Filter to only those in the date range
    return sortedDates
      .filter((date) => date >= customStartDate && date <= customEndDate)
      .map(createEntry);
  }, [
    skipDateGeneration,
    isAllSelected,
    customStartDate,
    customEndDate,
    historyData,
    availablePuzzles,
  ]);

  const today: string = getTodayLocalDate();

  if (isLoadingHistory) {
    return (
      <div className="score-history-page">
        <div className="score-history-page__loading">
          <Spinner size="large" label="Loading history" />
        </div>
      </div>
    );
  }

  return (
    <div className="score-history-page">
      <h2 className="score-history-page__title">History</h2>
      {error && (
        <p className="score-history-page__error">
          Could not load history from server
        </p>
      )}

      <DateFilter
        presetPeriod={presetPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onPresetChange={setPresetPeriod}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        showNavigation={false}
      />

      <div className="score-history-page__navigation">
        <button
          type="button"
          className="score-history-page__nav-button"
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
          className="score-history-page__nav-button"
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

      <table className="score-history-page__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Game</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan={2} className="score-history-page__empty">
                No games found
              </td>
            </tr>
          ) : (
            displayRows.map((entry: HistoryEntry) => (
              <tr key={entry.puzzle_date}>
                <td className="score-history-page__date-cell">
                  {formatDateForDisplay(entry.puzzle_date)}
                </td>
                <td className="score-history-page__game-cell">
                  {entry.played && entry.guesses ? (
                    <MiniGameBoard guesses={entry.guesses} />
                  ) : entry.in_progress && entry.guesses ? (
                    <div className="score-history-page__in-progress">
                      <MiniGameBoard guesses={entry.guesses} />
                      <Button
                        variant="flat"
                        href={`/${entry.puzzle_date}`}
                        className={
                          entry.puzzle_date === today
                            ? 'score-history-page__today-button'
                            : ''
                        }
                      >
                        Continue
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="flat"
                      href={`/${entry.puzzle_date}`}
                      className={
                        entry.puzzle_date === today
                          ? 'score-history-page__today-button'
                          : ''
                      }
                    >
                      Play
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
