import posthog from 'posthog-js';

interface GuessEvent {
  puzzleDate: string;
  attemptNumber: number;
  isCorrect: boolean;
}

interface GameCompleteEvent {
  puzzleDate: string;
  won: boolean;
  attempts: number;
}

interface Analytics {
  trackGuess: (event: GuessEvent) => void;
  trackGameComplete: (event: GameCompleteEvent) => void;
  trackPageView: (path: string) => void;
}

export const analytics: Analytics = {
  /**
   * Track when a user submits a guess.
   */
  trackGuess(event: GuessEvent): void {
    posthog.capture('guess_submitted', {
      puzzle_date: event.puzzleDate,
      attempt_number: event.attemptNumber,
      is_correct: event.isCorrect,
    });
  },

  /**
   * Track when a game is completed (won or lost).
   */
  trackGameComplete(event: GameCompleteEvent): void {
    posthog.capture('game_completed', {
      puzzle_date: event.puzzleDate,
      won: event.won,
      attempts: event.attempts,
    });
  },

  /**
   * Track page views (for SPA navigation).
   */
  trackPageView(path: string): void {
    posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
    });
  },
};
