import type { Decorator, Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import { Auth0Context, type Auth0ContextInterface } from '@auth0/auth0-react';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  type AnyRouter,
} from '@tanstack/react-router';
import type { GradedMove } from '../api/guess';
import type { HistoryEntry } from '../api/history';
import { MiniGameBoard } from '../components/MiniGameBoard';
import { Button } from '../components/ui/Button';
import './ScoreHistoryPage.scss';

// Mock data for demonstration
const mockGuessesWon: GradedMove[] = [
  [
    { letter: 'C', grade: 'correct' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'N', grade: 'correct' },
    { letter: 'E', grade: 'correct' },
  ],
];

const mockGuessesLost: GradedMove[] = [
  [
    { letter: 'S', grade: 'wrong' },
    { letter: 'T', grade: 'wrong' },
    { letter: 'A', grade: 'contained' },
    { letter: 'R', grade: 'contained' },
    { letter: 'E', grade: 'correct' },
  ],
  [
    { letter: 'B', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'V', grade: 'wrong' },
    { letter: 'E', grade: 'correct' },
  ],
  [
    { letter: 'G', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'C', grade: 'wrong' },
    { letter: 'E', grade: 'correct' },
  ],
  [
    { letter: 'T', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'D', grade: 'wrong' },
    { letter: 'E', grade: 'correct' },
  ],
  [
    { letter: 'F', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'M', grade: 'wrong' },
    { letter: 'E', grade: 'correct' },
  ],
  [
    { letter: 'P', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'A', grade: 'correct' },
    { letter: 'N', grade: 'correct' },
    { letter: 'K', grade: 'wrong' },
  ],
];

const mockGuessesInProgress: GradedMove[] = [
  [
    { letter: 'H', grade: 'wrong' },
    { letter: 'E', grade: 'contained' },
    { letter: 'L', grade: 'wrong' },
    { letter: 'L', grade: 'wrong' },
    { letter: 'O', grade: 'wrong' },
  ],
  [
    { letter: 'W', grade: 'wrong' },
    { letter: 'O', grade: 'wrong' },
    { letter: 'R', grade: 'correct' },
    { letter: 'D', grade: 'wrong' },
    { letter: 'S', grade: 'wrong' },
  ],
];

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

function formatDateForDisplay(dateStr: string): string {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Static story component that doesn't require Auth0
const ScoreHistoryPageStory = (): ReactElement => {
  const dates: string[] = getLast7Days();
  const today: string = dates[0];

  const historyData: HistoryEntry[] = [
    { puzzle_date: dates[0], played: false }, // Today - not played
    {
      puzzle_date: dates[1],
      played: false,
      in_progress: true,
      guesses: mockGuessesInProgress,
    }, // In progress
    {
      puzzle_date: dates[2],
      played: true,
      won: false,
      guesses: mockGuessesLost,
    },
    { puzzle_date: dates[3], played: false },
    { puzzle_date: dates[4], played: true, won: true, guesses: mockGuessesWon },
    { puzzle_date: dates[5], played: false },
    { puzzle_date: dates[6], played: true, won: true, guesses: mockGuessesWon },
  ];

  return (
    <div className="score-history-page">
      <h2 className="score-history-page__title">History</h2>
      <div className="score-history-page__grid">
        {historyData.map((entry: HistoryEntry) => (
          <div key={entry.puzzle_date} className="score-history-page__card">
            <div className="score-history-page__card-header">
              {formatDateForDisplay(entry.puzzle_date)}
              {entry.puzzle_date === today && (
                <span className="score-history-page__today-badge">Today</span>
              )}
            </div>
            <div
              className={`score-history-page__card-content ${
                entry.in_progress && entry.guesses
                  ? 'score-history-page__card-content--stacked'
                  : ''
              }`}
            >
              {entry.played && entry.guesses ? (
                <MiniGameBoard guesses={entry.guesses} won={entry.won} />
              ) : entry.in_progress && entry.guesses ? (
                <>
                  <MiniGameBoard guesses={entry.guesses} />
                  <Button variant="flat" href={`/${entry.puzzle_date}`}>
                    Continue Game
                  </Button>
                </>
              ) : (
                <Button variant="flat" href={`/${entry.puzzle_date}`}>
                  Play
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mockAuth0Context: Auth0ContextInterface = {
  isAuthenticated: true,
  isLoading: false,
  user: { name: 'Test User' },
  loginWithRedirect: async (): Promise<void> => {},
  loginWithPopup: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  getAccessTokenSilently: (): Promise<string> => Promise.resolve('mock-token'),
  getAccessTokenWithPopup: (): Promise<string> => Promise.resolve(''),
  getIdTokenClaims: (): Promise<undefined> => Promise.resolve(undefined),
  handleRedirectCallback: (): Promise<{ appState: Record<string, unknown> }> =>
    Promise.resolve({ appState: {} }),
} as Auth0ContextInterface;

const createMockRouter = (children: ReactNode): AnyRouter => {
  /* eslint-disable @typescript-eslint/typedef */
  const rootRoute = createRootRoute({
    component: (): ReactNode => children,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/history',
  });
  /* eslint-enable @typescript-eslint/typedef */
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, historyRoute]),
  });
};

const withProviders: Decorator = (Story): ReactElement => {
  const router: AnyRouter = createMockRouter(
    <Auth0Context.Provider value={mockAuth0Context}>
      <Story />
    </Auth0Context.Provider>,
  );
  return <RouterProvider router={router} />;
};

const meta: Meta<typeof ScoreHistoryPageStory> = {
  title: 'Pages/ScoreHistoryPage',
  component: ScoreHistoryPageStory,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
