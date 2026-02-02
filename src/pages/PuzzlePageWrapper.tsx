import type { ReactElement } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { HomePage } from './HomePage';

/**
 * Wrapper for puzzle route that applies a key based on puzzleDate.
 * This forces React to remount HomePage when navigating between different dates.
 */
export const PuzzlePageWrapper = (): ReactElement => {
  const { puzzleDate } = useLoaderData({ from: '/$puzzleDate' }) as {
    puzzleDate: string;
  };
  // Key forces remount when navigating between puzzle dates
  return <HomePage key={puzzleDate} />;
};
