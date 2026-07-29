import { describe, expect, it } from 'vitest';
import {
  AppError,
  isAppError,
  serialiseError,
  statusForErrorCode,
  toAppError,
} from './index.js';

describe('AppError', () => {
  it('derives the status from the code', () => {
    expect(AppError.notFound().status).toBe(404);
    expect(AppError.forbidden().status).toBe(403);
    expect(AppError.unauthorized().status).toBe(401);
    expect(AppError.internal().status).toBe(500);
  });

  it('treats only internal errors as unexpected', () => {
    expect(AppError.badRequest('bad').expected).toBe(true);
    expect(AppError.forbidden().expected).toBe(true);
    expect(AppError.internal().expected).toBe(false);
  });

  it('omits details from the response when none are supplied', () => {
    const envelope = serialiseError(AppError.notFound());

    // Asserted on the serialised envelope rather than the object shape: what
    // matters is that no `details` key reaches the client.
    expect(Object.keys(envelope.error)).toEqual(['code', 'message']);
  });

  it('builds field-level validation errors', () => {
    const error = AppError.validation([
      { path: 'contact.email', message: 'Enter a valid email address' },
    ]);

    expect(error.status).toBe(422);
    expect(error.details).toEqual({
      fieldErrors: [
        { path: 'contact.email', message: 'Enter a valid email address' },
      ],
    });
  });

  it('preserves the underlying cause without exposing it', () => {
    const cause = new Error('connection reset');
    const error = AppError.internal('Database unavailable', cause);

    expect(error.cause).toBe(cause);
    expect(serialiseError(error).error.message).toBe('Internal server error');
  });
});

describe('statusForErrorCode', () => {
  it('maps every code to a status', () => {
    expect(statusForErrorCode('rate_limited')).toBe(429);
    expect(statusForErrorCode('service_unavailable')).toBe(503);
    expect(statusForErrorCode('payload_too_large')).toBe(413);
  });
});

describe('toAppError', () => {
  it('passes an AppError through unchanged', () => {
    const original = AppError.conflict('Already enrolled');
    expect(toAppError(original)).toBe(original);
  });

  it('wraps an unknown throw as an internal fault', () => {
    const wrapped = toAppError(new TypeError('x is not a function'));

    expect(wrapped.code).toBe('internal_error');
    expect(wrapped.expected).toBe(false);
    expect(wrapped.message).toBe('x is not a function');
  });

  it('wraps a non-error throw', () => {
    expect(toAppError('something went wrong').message).toBe(
      'something went wrong',
    );
  });

  it('recognises its own type', () => {
    expect(isAppError(AppError.notFound())).toBe(true);
    expect(isAppError(new Error('plain'))).toBe(false);
  });
});

describe('serialiseError', () => {
  it('withholds an unexpected error message by default', () => {
    const envelope = serialiseError(
      AppError.internal('Postgres connection string is invalid'),
      { requestId: 'req-9' },
    );

    // The operator message must not reach the client: it routinely contains
    // hostnames, query fragments and occasionally credentials.
    expect(envelope.error.message).toBe('Internal server error');
    expect(envelope.error.requestId).toBe('req-9');
  });

  it('exposes an unexpected error message when explicitly permitted', () => {
    const envelope = serialiseError(AppError.internal('Boom'), {
      exposeInternalMessage: true,
    });

    expect(envelope.error.message).toBe('Boom');
  });

  it('always exposes an expected error message', () => {
    const envelope = serialiseError(
      AppError.badRequest('Start date must precede end date'),
    );

    expect(envelope.error).toEqual({
      code: 'bad_request',
      message: 'Start date must precede end date',
    });
  });
});
