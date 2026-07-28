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

const statusByCode: Record<ErrorCode, number> = {
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

/**
 * The only error type route handlers and services should throw. Anything else
 * reaching the error middleware is treated as an unexpected internal fault and
 * has its message withheld from the client.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = statusByCode[code];
    if (details !== undefined) {
      this.details = details;
    }
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError('bad_request', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError('unauthorized', message);
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError('forbidden', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError('not_found', message);
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError('conflict', message, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError('unprocessable_entity', message, details);
  }
}
