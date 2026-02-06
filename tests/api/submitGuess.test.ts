import { describe, expect, test } from '@rstest/core';
import type { AxiosError } from 'axios';
import {
  ScorekeeperApiError,
  toScorekeeperApiError,
} from '../../src/api/errors';

describe('toScorekeeperApiError', () => {
  test('wraps 4xx error and extracts message from { error: { message } }', () => {
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

  test('returns null for 5xx server errors', () => {
    const axiosError: AxiosError = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { error: { message: 'Internal server error' } },
      },
    } as AxiosError;

    const result: ScorekeeperApiError | null =
      toScorekeeperApiError(axiosError);

    expect(result).toBeNull();
  });

  test('returns null for network errors (no response)', () => {
    const axiosError: AxiosError = {
      isAxiosError: true,
      response: undefined,
    } as AxiosError;

    const result: ScorekeeperApiError | null =
      toScorekeeperApiError(axiosError);

    expect(result).toBeNull();
  });
});
