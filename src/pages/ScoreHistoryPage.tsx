import { useState, useEffect, type ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from '@tanstack/react-router';
import {
  getHistory,
  type HistoryEntry,
  type HistoryResponse,
} from '../api/history';
import { MiniGameBoard } from '../components/MiniGameBoard';
import { Spinner } from '../components/ui/Spinner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './ScoreHistoryPage.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

function formatDateForDisplay(dateStr: string): string {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTodayLocalDate(): string {
  const now: Date = new Date();
  const year: number = now.getFullYear();
  const month: string = String(now.getMonth() + 1).padStart(2, '0');
  const day: string = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLast7Days(): string[] {
  const dates: string[] = [];
  const today: Date = new Date();

  for (let i: number = 0; i < 7; i++) {
    const date: Date = new Date(today);
    date.setDate(today.getDate() - i);
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export const ScoreHistoryPage = (): ReactElement => {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [authTokens] = useLocalStorage<AuthTokens>('auth_tokens');
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!hasStoredTokens && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/history' },
      });
    } else if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/history' },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, hasStoredTokens]);

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token: string = await getAccessTokenSilently();
        const response: HistoryResponse = await getHistory(token);
        setHistoryData(response.entries);
      } catch (e: unknown) {
        const err: Error = e instanceof Error ? e : new Error(String(e));
        setError(err);
        // Create placeholder entries for the last 7 days if fetch fails
        const placeholderEntries: HistoryEntry[] = getLast7Days().map(
          (date: string) => ({
            puzzle_date: date,
            played: false,
          }),
        );
        setHistoryData(placeholderEntries);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      fetchHistory();
    }
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  // Show spinner while redirecting or loading
  if (!hasStoredTokens && !isAuthenticated) {
    return (
      <div className="score-history-page">
        <div className="score-history-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="score-history-page">
        <div className="score-history-page__loading">
          <Spinner size="large" label="Loading" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="score-history-page">
        <div className="score-history-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  if (isLoadingHistory) {
    return (
      <div className="score-history-page">
        <div className="score-history-page__loading">
          <Spinner size="large" label="Loading history" />
        </div>
      </div>
    );
  }

  const today: string = getTodayLocalDate();

  return (
    <div className="score-history-page">
      <h2 className="score-history-page__title">Score History</h2>
      {error && (
        <p className="score-history-page__error">
          Could not load history from server
        </p>
      )}
      <div className="score-history-page__grid">
        {historyData.map((entry: HistoryEntry) => (
          <div key={entry.puzzle_date} className="score-history-page__card">
            <div className="score-history-page__card-header">
              {formatDateForDisplay(entry.puzzle_date)}
              {entry.puzzle_date === today && (
                <span className="score-history-page__today-badge">Today</span>
              )}
            </div>
            <div className="score-history-page__card-content">
              {entry.played && entry.guesses ? (
                <MiniGameBoard guesses={entry.guesses} won={entry.won} />
              ) : (
                <Link
                  to="/"
                  search={{ date: entry.puzzle_date }}
                  className="score-history-page__play-button"
                >
                  Play
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
