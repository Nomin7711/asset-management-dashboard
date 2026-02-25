import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { getValidationErrors, getTelemetryWebSocketUrl } from './client';

describe('getValidationErrors', () => {
  it('returns string detail as single message', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    const err = {
      isAxiosError: true,
      response: { data: { detail: 'Invalid email' } },
    };
    expect(getValidationErrors(err)).toEqual(['Invalid email']);
    vi.restoreAllMocks();
  });

  it('extracts msg from array detail', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    const err = {
      isAxiosError: true,
      response: {
        data: {
          detail: [
            { msg: 'Field required', loc: ['body', 'name'] },
            { msg: 'Invalid email', loc: ['body', 'alert_email'] },
          ],
        },
      },
    };
    expect(getValidationErrors(err)).toEqual(['Field required', 'Invalid email']);
    vi.restoreAllMocks();
  });

  it('returns default message for non-axios error', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    expect(getValidationErrors(new Error('network'))).toEqual([
      'An unexpected error occurred.',
    ]);
    vi.restoreAllMocks();
  });
});

describe('getTelemetryWebSocketUrl', () => {
  it('converts http base to ws and appends telemetry path', () => {
    const url = getTelemetryWebSocketUrl();
    expect(url).toMatch(/^ws:\/\//);
    expect(url).toContain('/ws/telemetry');
  });
});
