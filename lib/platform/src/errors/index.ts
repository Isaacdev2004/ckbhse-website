/**
 * The platform's single error taxonomy.
 *
 * This lives in `lib/platform` rather than in the API server because services
 * and repositories need to signal failure without depending on Express. The
 * transport layer maps `AppError.status` onto an HTTP response; nothing else
 * needs to know a transport exists.
 *
 * The code set is deliberately identical to the `ErrorResponse.error.code` enum
 * in `lib/api-spec/openapi.yaml`. Adding a code requires updating both, and the
 * exhaustiveness of `STATUS_BY_CODE` makes the compiler enforce half of that.
 */

export type ErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'payload_too_large'
  | 'unprocessable_entity'
  | 'rate_limited'
  | 'internal_error'
  | 'service_unavailable';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  payload_too_large: 413,
  unprocessable_entity: 422,
  rate_limited: 429,
  internal_error: 500,
  service_unavailable: 503,
};

export function statusForErrorCode(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

/**
 * A single field-level validation failure. Kept transport-agnostic so the same
 * shape serves HTTP responses, job failures and CLI output.
 */
export interface FieldError {
  /** Dotted path to the offending field, e.g. `contact.email`. */
  readonly path: string;
  readonly message: string;
}

export interface AppErrorOptions {
  /** Structured, client-safe detail. Never put internal state here. */
  readonly details?: unknown;
  /** The underlying fault, preserved for logging but never serialised. */
  readonly cause?: unknown;
}

/**
 * The only error type application code should throw.
 *
 * Anything else reaching the transport boundary is treated as an unexpected
 * internal fault and has its message withheld from the client, so throwing
 * `AppError` is also the mechanism for opting a message *in* to the response.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  /**
   * True when the error is a modelled outcome (validation, permission denied,
   * missing record) rather than a fault. Expected errors are logged at info;
   * unexpected ones carry a stack and page someone.
   */
  readonly expected: boolean;

  constructor(code: ErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : {});
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.expected = code !== 'internal_error';
    if (options.details !== undefined) {
      this.details = options.details;
    }
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string, options?: AppErrorOptions): AppError {
    return new AppError('bad_request', message, options);
  }

  /** No credentials, or credentials that could not be verified. */
  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError('unauthorized', message);
  }

  /** Authenticated, but lacking the required permission or tenant scope. */
  static forbidden(
    message = 'You do not have access to this resource',
  ): AppError {
    return new AppError('forbidden', message);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError('not_found', message);
  }

  static conflict(message: string, options?: AppErrorOptions): AppError {
    return new AppError('conflict', message, options);
  }

  static payloadTooLarge(message = 'Request body is too large'): AppError {
    return new AppError('payload_too_large', message);
  }

  static rateLimited(
    message = 'Too many requests, please retry later',
  ): AppError {
    return new AppError('rate_limited', message);
  }

  static unprocessable(message: string, options?: AppErrorOptions): AppError {
    return new AppError('unprocessable_entity', message, options);
  }

  static serviceUnavailable(
    message = 'Service temporarily unavailable',
  ): AppError {
    return new AppError('service_unavailable', message);
  }

  /**
   * An unexpected fault. The message is for operators, not users: the transport
   * layer replaces it before responding in production.
   */
  static internal(
    message = 'Internal server error',
    cause?: unknown,
  ): AppError {
    return new AppError(
      'internal_error',
      message,
      cause !== undefined ? { cause } : {},
    );
  }

  /**
   * Field-level validation failure. Separate from `unprocessable` because the
   * details carry a known shape that clients can render against form fields.
   */
  static validation(
    fieldErrors: readonly FieldError[],
    message = 'Request validation failed',
  ): AppError {
    return new AppError('unprocessable_entity', message, {
      details: { fieldErrors },
    });
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/**
 * Narrow an unknown thrown value to an `AppError`, wrapping anything unexpected
 * as an internal fault with the original preserved as `cause`. Use at trust
 * boundaries so downstream code can rely on a single error type.
 */
export function toAppError(value: unknown): AppError {
  if (isAppError(value)) return value;

  const message = value instanceof Error ? value.message : String(value);
  return AppError.internal(message, value);
}

/**
 * The wire shape shared by every failing endpoint, matching `ErrorResponse` in
 * the OpenAPI specification.
 */
export interface ErrorEnvelope {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly details?: unknown;
    readonly requestId?: string;
  };
}

export interface SerialiseOptions {
  readonly requestId?: string;
  /**
   * When false, an unexpected error's message is replaced with a generic one so
   * internal detail cannot leak. Set from the environment, not per call site.
   */
  readonly exposeInternalMessage?: boolean;
}

export function serialiseError(
  error: AppError,
  options: SerialiseOptions = {},
): ErrorEnvelope {
  const { requestId, exposeInternalMessage = false } = options;

  const message =
    error.expected || exposeInternalMessage
      ? error.message
      : 'Internal server error';

  return {
    error: {
      code: error.code,
      message,
      ...(error.details !== undefined ? { details: error.details } : {}),
      ...(requestId !== undefined ? { requestId } : {}),
    },
  };
}
