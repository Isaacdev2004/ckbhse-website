/**
 * Logging contracts.
 *
 * The platform separates logs by *channel*, because the four kinds have
 * genuinely different audiences, retention periods and alerting rules. Mixing
 * them means either over-retaining application noise or under-retaining security
 * events, and it makes "show me every access denial this week" a text search.
 *
 * The interface is transport-agnostic so `lib/platform` does not depend on Pino;
 * the API server supplies the implementation.
 */

import type { AuthorizationContext } from '../authorization/index.js';

export type LogChannel =
  /** Ordinary operational logging. High volume, short retention. */
  | 'app'
  /** Access decisions, authentication outcomes, rate limiting. Alertable. */
  | 'security'
  /** Timing and resource use. Feeds performance budgets, not alerts. */
  | 'performance'
  /**
   * A mirror of audit events, for operators who need them in the log pipeline.
   * The database audit log remains the record of truth; this copy is
   * convenience, and must never be the only place an event lands.
   */
  | 'audit';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Fields attached to every entry.
 *
 * `requestId` is present on all of them by design: it is what makes a log line,
 * an audit row and the `requestId` a user reads off an error page joinable, and
 * a support conversation resolvable.
 */
export interface LogContext {
  // Explicitly nullable rather than merely optional. For a log field, "absent"
  // and "present but undefined" are the same thing, and forcing every call site
  // to spread-guard each identifier would add noise without adding safety.
  readonly requestId?: string | undefined;
  readonly userId?: string | undefined;
  readonly organizationId?: string | undefined;
  readonly sessionId?: string | undefined;
  readonly [key: string]: unknown;
}

export interface Logger {
  child(context: LogContext): Logger;
  log(level: LogLevel, context: LogContext, message: string): void;
  trace(context: LogContext, message: string): void;
  debug(context: LogContext, message: string): void;
  info(context: LogContext, message: string): void;
  warn(context: LogContext, message: string): void;
  error(context: LogContext, message: string): void;
  fatal(context: LogContext, message: string): void;
}

/** Provides one logger per channel. */
export interface LoggerFactory {
  forChannel(channel: LogChannel): Logger;
}

/**
 * Derive log fields from an authorization context, so every call site attaches
 * the same identifiers under the same names. Inconsistent field names are what
 * make log aggregation queries unwritable.
 */
export function logContextFrom(context: AuthorizationContext): LogContext {
  return {
    requestId: context.metadata.requestId,
    ...(context.userId !== undefined ? { userId: context.userId } : {}),
    ...(context.organizationId !== undefined
      ? { organizationId: context.organizationId }
      : {}),
    ...(context.sessionId !== undefined
      ? { sessionId: context.sessionId }
      : {}),
    actorKind: context.actorKind,
  };
}

/**
 * Security event names.
 *
 * A closed set, so alerting rules can be written against known values instead of
 * message-text patterns that break the first time someone rewords a log line.
 */
export type SecurityEvent =
  | 'authentication.succeeded'
  | 'authentication.failed'
  | 'authorization.denied'
  | 'session.created'
  | 'session.revoked'
  | 'rate_limit.exceeded'
  | 'cors.rejected'
  | 'csrf.rejected'
  | 'tenant.cross_boundary_access'
  | 'input.validation_failed';

export interface SecurityLogFields extends LogContext {
  readonly event: SecurityEvent;
  readonly ipAddress?: string | undefined;
  readonly userAgent?: string | undefined;
  readonly outcome: 'allowed' | 'denied';
}

/** Records a security event on the security channel at a consistent level. */
export function recordSecurityEvent(
  logger: Logger,
  fields: SecurityLogFields,
  message: string,
): void {
  // Denials are warnings: individually expected, but a spike is an incident, and
  // that distinction is only visible if the level is consistent.
  const level: LogLevel = fields.outcome === 'denied' ? 'warn' : 'info';
  logger.log(level, fields, message);
}

export interface PerformanceLogFields extends LogContext {
  readonly operation: string;
  readonly durationMs: number;
  readonly slow: boolean;
}

/**
 * Records a timing, flagging it against a budget.
 *
 * The budget is passed in rather than fixed, because Document 03.5 sets different
 * targets per operation class, and a single global threshold would either hide
 * slow queries or shout about slow reports.
 */
export function recordPerformance(
  logger: Logger,
  context: LogContext,
  operation: string,
  durationMs: number,
  budgetMs: number,
): void {
  const slow = durationMs > budgetMs;
  const fields: PerformanceLogFields = {
    ...context,
    operation,
    durationMs,
    slow,
  };

  logger.log(slow ? 'warn' : 'debug', fields, `${operation} completed`);
}
