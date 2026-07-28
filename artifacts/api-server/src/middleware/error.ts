import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod/v4';
import { ApiError, type ErrorCode } from '../lib/errors';
import { isProduction } from '../config/env';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(ApiError.notFound());
};

interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

function classify(err: unknown): {
  code: ErrorCode;
  message: string;
  details?: unknown;
  expected: boolean;
} {
  if (err instanceof ApiError) {
    return {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
      expected: true,
    };
  }

  if (err instanceof ZodError) {
    return {
      code: 'unprocessable_entity',
      message: 'Request validation failed',
      details: z.treeifyError(err),
      expected: true,
    };
  }

  // body-parser signals malformed JSON and oversized payloads with a `type`.
  const parserError = err as BodyParserError;
  if (parserError?.type === 'entity.too.large') {
    return {
      code: 'payload_too_large',
      message: 'Request body is too large',
      expected: true,
    };
  }
  if (parserError?.type === 'entity.parse.failed') {
    return {
      code: 'bad_request',
      message: 'Request body is not valid JSON',
      expected: true,
    };
  }

  return {
    code: 'internal_error',
    message: 'Internal server error',
    expected: false,
  };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { code, message, details, expected } = classify(err);
  const status = err instanceof ApiError ? err.status : statusFor(code);

  // Unexpected faults are logged at error with the stack; expected ones are
  // ordinary control flow and would otherwise drown out real incidents.
  if (expected) {
    req.log?.info({ code, status }, 'Request rejected');
  } else {
    req.log?.error({ err, code, status }, 'Unhandled request error');
  }

  if (res.headersSent) {
    res.destroy();
    return;
  }

  res.status(status).json({
    error: {
      code,
      // Never leak an unexpected error's message to the client in production.
      message: expected || !isProduction ? message : 'Internal server error',
      ...(details !== undefined ? { details } : {}),
      requestId: req.id,
    },
  });
};

function statusFor(code: ErrorCode): number {
  return new ApiError(code, '').status;
}
