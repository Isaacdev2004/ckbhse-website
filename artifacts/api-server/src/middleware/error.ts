import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError as ZodErrorV4 } from 'zod/v4';
import { ZodError as ZodErrorV3 } from 'zod';
import {
  AppError,
  serialiseError,
  type FieldError,
} from '@workspace/platform/errors';
import { recordSecurityEvent } from '@workspace/platform/logging';
import { isProduction } from '../config';
import { securityLogger } from '../lib/logger';

/**
 * The single place an error becomes an HTTP response.
 *
 * Every failure path converges here so the envelope is identical across the API,
 * which is what lets the client have one error handler rather than one per
 * endpoint. The error taxonomy itself lives in `@workspace/platform/errors`; this
 * file only translates.
 */

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(AppError.notFound());
};

interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

/** Flatten a Zod error into the platform's field-error shape. */
function toFieldErrors(error: ZodErrorV4 | ZodErrorV3): FieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function isZodError(error: unknown): error is ZodErrorV4 | ZodErrorV3 {
  return error instanceof ZodErrorV4 || error instanceof ZodErrorV3;
}

/**
 * Map anything thrown into an `AppError`.
 *
 * Unrecognised throws deliberately become `internal_error` with their message
 * withheld, because an arbitrary exception message is as likely to contain a
 * connection string as anything useful to a client.
 */
function normalise(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isZodError(error)) {
    return AppError.validation(toFieldErrors(error));
  }

  // body-parser signals malformed JSON and oversized payloads with a `type`.
  const parserError = error as BodyParserError;
  if (parserError?.type === 'entity.too.large') {
    return AppError.payloadTooLarge();
  }
  if (parserError?.type === 'entity.parse.failed') {
    return AppError.badRequest('Request body is not valid JSON');
  }

  return AppError.internal(
    error instanceof Error ? error.message : 'Unknown error',
    error,
  );
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = normalise(err);

  // Expected errors are ordinary control flow and would drown out real incidents
  // if logged at error; unexpected ones carry the stack.
  if (error.expected) {
    req.log?.info(
      { code: error.code, status: error.status, requestId: req.requestId },
      'Request rejected',
    );
  } else {
    req.log?.error(
      { err, code: error.code, status: error.status, requestId: req.requestId },
      'Unhandled request error',
    );
  }

  // Access denials also go to the security channel, where they are alertable as a
  // rate rather than read individually.
  if (error.code === 'forbidden' || error.code === 'unauthorized') {
    recordSecurityEvent(
      securityLogger,
      {
        event: 'authorization.denied',
        outcome: 'denied',
        requestId: req.requestId,
        ...(req.auth?.userId !== undefined ? { userId: req.auth.userId } : {}),
        ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
        method: req.method,
        path: req.path,
        code: error.code,
      },
      'Request denied',
    );
  }

  if (res.headersSent) {
    // A partially-written response cannot be replaced with an error envelope, so
    // the connection is destroyed rather than sending a corrupt body.
    res.destroy();
    return;
  }

  res.status(error.status).json(
    serialiseError(error, {
      ...(req.requestId !== undefined ? { requestId: req.requestId } : {}),
      // Internal messages are visible outside production, where they save a trip
      // to the logs, and withheld in production, where they leak.
      exposeInternalMessage: !isProduction,
    }),
  );
};
