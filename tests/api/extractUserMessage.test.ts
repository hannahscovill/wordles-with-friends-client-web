import { describe, expect, test } from '@rstest/core';
import { parseApiErrorMessage } from '../../src/api/errors';

describe('parseApiErrorMessage', () => {
  test('extracts message from { error: { code, message } } format', () => {
    const responseBody: { error: { code: string; message: string } } = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Word not in dictionary',
      },
    };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Word not in dictionary');
  });

  test('extracts message from { error: "message" } format', () => {
    const responseBody: { error: string } = {
      error: 'Something went wrong',
    };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Something went wrong');
  });

  test('extracts message from { message: "message" } format', () => {
    const responseBody: { message: string } = {
      message: 'Invalid input',
    };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Invalid input');
  });

  test('extracts message from { detail: "message" } format', () => {
    const responseBody: { detail: string } = {
      detail: 'Not found',
    };

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Not found');
  });

  test('parses JSON string and extracts message', () => {
    const responseBody: string = JSON.stringify({
      error: { message: 'Parsed from JSON' },
    });

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Parsed from JSON');
  });

  test('returns raw string for non-JSON short responses', () => {
    const responseBody: string = 'Plain text error';

    const result: string = parseApiErrorMessage(responseBody, 'fallback');

    expect(result).toBe('Plain text error');
  });

  test('returns fallback for empty string', () => {
    const result: string = parseApiErrorMessage('', 'fallback');

    expect(result).toBe('fallback');
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
