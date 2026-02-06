import { describe, expect, test } from '@rstest/core';
import { ApiError } from '../../src/api/errors';
import {
  extractUserMessage,
  isAxiosErrorWithResponse,
} from '../../src/api/scorekeeper';

describe('extractUserMessage', () => {
  test('extracts message from { error: { code, message } } format', () => {
    const responseBody: string = JSON.stringify({
      error: {
        code: 'BAD_REQUEST',
        message: 'Word not in dictionary',
      },
    });
    const error: ApiError = new ApiError(
      'Request failed: 400',
      400,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Word not in dictionary');
  });

  test('extracts message from { error: "message" } format', () => {
    const responseBody: string = JSON.stringify({
      error: 'Something went wrong',
    });
    const error: ApiError = new ApiError(
      'Request failed: 400',
      400,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Something went wrong');
  });

  test('extracts message from { message: "message" } format', () => {
    const responseBody: string = JSON.stringify({
      message: 'Invalid input',
    });
    const error: ApiError = new ApiError(
      'Request failed: 400',
      400,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Invalid input');
  });

  test('extracts message from { detail: "message" } format', () => {
    const responseBody: string = JSON.stringify({
      detail: 'Not found',
    });
    const error: ApiError = new ApiError(
      'Request failed: 404',
      404,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Not found');
  });

  test('returns raw body for non-JSON short responses', () => {
    const responseBody: string = 'Plain text error';
    const error: ApiError = new ApiError(
      'Request failed: 500',
      500,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Plain text error');
  });

  test('returns error.message when responseBody is empty', () => {
    const error: ApiError = new ApiError('Request failed: 500', 500, '');

    const result: string = extractUserMessage(error);

    expect(result).toBe('Request failed: 500');
  });

  test('returns error.message when responseBody is undefined', () => {
    const error: ApiError = new ApiError('Request failed: 500', 500, undefined);

    const result: string = extractUserMessage(error);

    expect(result).toBe('Request failed: 500');
  });

  test('returns error.message for unrecognized JSON format', () => {
    const responseBody: string = JSON.stringify({
      foo: 'bar',
      baz: 123,
    });
    const error: ApiError = new ApiError(
      'Request failed: 400',
      400,
      responseBody,
    );

    const result: string = extractUserMessage(error);

    expect(result).toBe('Request failed: 400');
  });
});

describe('isAxiosErrorWithResponse', () => {
  test('returns true for AxiosError with response', () => {
    const axiosError: {
      isAxiosError: boolean;
      response: { status: number; data: { error: string } };
    } = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Bad Request' },
      },
    };

    expect(isAxiosErrorWithResponse(axiosError)).toBe(true);
  });

  test('returns false for AxiosError without response', () => {
    const axiosError: { isAxiosError: boolean; response: undefined } = {
      isAxiosError: true,
      response: undefined,
    };

    expect(isAxiosErrorWithResponse(axiosError)).toBe(false);
  });

  test('returns false for regular Error', () => {
    const error: Error = new Error('Network Error');

    expect(isAxiosErrorWithResponse(error)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isAxiosErrorWithResponse(null)).toBe(false);
  });

  test('returns false for non-object', () => {
    expect(isAxiosErrorWithResponse('string error')).toBe(false);
  });
});
