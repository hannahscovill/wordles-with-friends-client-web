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

interface MobileTestTrackSignupEvent {
  source: 'game_status_modal' | 'whats_new_page';
  ios: boolean;
  android: boolean;
}

interface Analytics {
  trackGuess: (event: GuessEvent) => void;
  trackGameComplete: (event: GameCompleteEvent) => void;
  trackMobileTestTrackSignup: (event: MobileTestTrackSignupEvent) => void;
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

  trackMobileTestTrackSignup(event: MobileTestTrackSignupEvent): void {
    posthog.capture('mobile_test_track_signup', {
      source: event.source,
      ios: event.ios,
      android: event.android,
    });
  },
};
