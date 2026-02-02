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
  type HistoryEntry,
  type HistoryResponse,
} from '../api/history';
import { MiniGameBoard } from '../components/MiniGameBoard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { DateFilter } from '../components/DateFilter';
import {
  type PresetPeriod,
  type DateRange,
  formatDateForDisplay,
  getTodayLocalDate,
  generateDatesInRange,
  getDateRange,
  navigateDateRange,
} from '../utils/dates';
import './ScoreHistoryPage.scss';

export const ScoreHistoryPage = (): ReactElement => {
  // Router protects this route - we trust we're authenticated if rendering
  const { getAccessTokenSilently } = useAuth0();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
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

  // Fetch history data
  const fetchHistory: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      setIsLoadingHistory(true);
      try {
        const token: string = await getAccessTokenSilently();
        const response: HistoryResponse = await getHistory(token);
        setHistoryData(response.entries);
        setError(null);
      } catch (e: unknown) {
        const err: Error = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setHistoryData([]);
      } finally {
        setIsLoadingHistory(false);
      }
    }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Compute display rows: merge all dates in range with history data
  const displayRows: HistoryEntry[] = useMemo(() => {
    // For "All" mode, just show data from API
    if (isAllSelected) {
      return historyData;
    }

    // For "Year" mode, skip generation (too many dates) and filter API data
    if (skipDateGeneration) {
      return historyData.filter((entry) => {
        if (!customStartDate && !customEndDate) return true;
        if (customStartDate && entry.puzzle_date < customStartDate)
          return false;
        if (customEndDate && entry.puzzle_date > customEndDate) return false;
        return true;
      });
    }

    // If we don't have both start and end dates, filter API data
    if (!customStartDate || !customEndDate) {
      return historyData;
    }

    // Generate all dates in the range (newest first)
    const allDatesInRange: string[] = generateDatesInRange(
      customStartDate,
      customEndDate,
      true,
    );

    // Create a map of history by date
    const historyByDate: Map<string, HistoryEntry> = new Map(
      historyData.map((entry) => [entry.puzzle_date, entry]),
    );

    // Merge: for each date, use existing history or create empty entry
    return allDatesInRange.map((date) => {
      const existingEntry: HistoryEntry | undefined = historyByDate.get(date);
      if (existingEntry) {
        return existingEntry;
      }
      // Create empty entry for date without history
      return { puzzle_date: date, played: false };
    });
  }, [
    skipDateGeneration,
    isAllSelected,
    customStartDate,
    customEndDate,
    historyData,
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
                  {entry.puzzle_date === today && (
                    <span className="score-history-page__today-badge">
                      Today
                    </span>
                  )}
                </td>
                <td className="score-history-page__game-cell">
                  {entry.played && entry.guesses ? (
                    <MiniGameBoard guesses={entry.guesses} won={entry.won} />
                  ) : entry.in_progress && entry.guesses ? (
                    <div className="score-history-page__in-progress">
                      <MiniGameBoard guesses={entry.guesses} />
                      <Button variant="flat" href={`/${entry.puzzle_date}`}>
                        Continue
                      </Button>
                    </div>
                  ) : (
                    <Button variant="flat" href={`/${entry.puzzle_date}`}>
                      Play
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
    </div>
  );
};
