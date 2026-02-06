import { describe, expect, test } from '@rstest/core';
import { parseApiErrorMessage } from '../../src/api/errors';

describe('parseApiErrorMessage', () => {
  test('extracts message from { error: { message } } format', () => {
    const responseBody: { error: { code: string; message: string } } = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Word not in dictionary',
      },
    };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Word not in dictionary');
  });

  test('returns fallback for null', () => {
    const result: string = parseApiErrorMessage(null, 'fallback');

    expect(result).toBe('fallback');
  });

  test('returns fallback for unrecognized object format', () => {
    const responseBody: { foo: string } = { foo: 'bar' };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('fallback');
  });
});
