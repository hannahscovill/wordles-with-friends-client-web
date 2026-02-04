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
}

export const analytics: Analytics = {
  trackGuess(event: GuessEvent): void {
    posthog.capture('guess_submitted', {
      puzzle_date: event.puzzleDate,
      attempt_number: event.attemptNumber,
      is_correct: event.isCorrect,
    });
  },

  trackGameComplete(event: GameCompleteEvent): void {
    posthog.capture('game_completed', {
      puzzle_date: event.puzzleDate,
      won: event.won,
      attempts: event.attempts,
    });
  },
};
