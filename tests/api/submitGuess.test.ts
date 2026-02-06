import { describe, expect, test } from '@rstest/core';
import type { AxiosError } from 'axios';
import {
  ScorekeeperApiError,
  toScorekeeperApiError,
} from '../../src/api/errors';

describe('submitGuess error handling', () => {
  test('toScorekeeperApiError extracts message from { error: { message } } format', () => {
    const axiosError: AxiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          error: {
            code: 'BAD_REQUEST',
            message: 'Word not in dictionary',
          },
        },
      },
    } as AxiosError;

    const result: ScorekeeperApiError | null =
      toScorekeeperApiError(axiosError);

    expect(result).not.toBeNull();
    expect(result?.statusCode).toBe(400);
    expect(result?.userMessage).toBe('Word not in dictionary');
  });

  test('toScorekeeperApiError extracts message from { error: "string" } format', () => {
    const axiosError: AxiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Invalid guess format' },
      },
    } as AxiosError;

    const result: ScorekeeperApiError | null =
      toScorekeeperApiError(axiosError);

    expect(result).not.toBeNull();
    expect(result?.statusCode).toBe(400);
    expect(result?.userMessage).toBe('Invalid guess format');
  });

  test('toScorekeeperApiError returns null for network errors (no response)', () => {
    const axiosError: AxiosError = {
      isAxiosError: true,
      response: undefined,
    } as AxiosError;

    const result: ScorekeeperApiError | null =
      toScorekeeperApiError(axiosError);

    expect(result).toBeNull();
  });
});
