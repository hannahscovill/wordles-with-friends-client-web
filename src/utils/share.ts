import type { GuessLetterProps } from '../components/GuessLetter';

/**
 * Build a Wordle-style share string with emoji grid and puzzle link.
 *
 * @param guesses  - Array of completed guess rows (each row is an array of GuessLetterProps)
 * @param puzzleDate - The puzzle date string, e.g. "2026-02-18"
 * @param won - Whether the player won
 */
export function generateShareText(
  guesses: GuessLetterProps[][],
  puzzleDate: string,
  won: boolean,
): string {
  const attempts: string = won ? String(guesses.length) : 'X';
  const header: string = `Wordles with Friends ${puzzleDate} ${attempts}/6`;

  const grid: string = guesses
    .map((row: GuessLetterProps[]): string =>
      row
        .map((tile: GuessLetterProps): string => {
          if (tile.correct_letter_and_position) return '🟩';
          if (tile.letter_contained_in_answer) return '🟨';
          return '⬜';
        })
        .join(''),
    )
    .join('\n');

  const link: string = `${window.location.origin}/${puzzleDate}`;

  return `${header}\n\n${grid}\n\n${link}`;
}

/**
 * Share the result text using the native share sheet (mobile) or clipboard (desktop).
 * Returns which method was used so the caller can show a toast if needed.
 */
export async function shareResult(
  text: string,
): Promise<{ method: 'shared' | 'copied' }> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return { method: 'shared' };
    } catch (err: unknown) {
      // User cancelled share or share failed — fall through to clipboard
      if (err instanceof Error && err.name === 'AbortError') {
        return { method: 'shared' };
      }
    }
  }

  await navigator.clipboard.writeText(text);
  return { method: 'copied' };
}
