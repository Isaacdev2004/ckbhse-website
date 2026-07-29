/**
 * The audit framework.
 *
 * BRS section 10 makes audit logging mandatory and the log immutable. Two
 * properties of this design carry that:
 *
 *  - `AuditEvent` is the only shape a sink accepts, so every entry has an actor,
 *    an action, a target and a timestamp. There is no partial variant.
 *  - There is no update or delete anywhere in this module. Immutability is also
 *    enforced at the database role once the schema lands (Document 03.5 section
 *    12.7), because a convention that only exists in application code is a
 *    convention that eventually gets broken.
 *
 * This module deliberately contains no business-specific events. Domains supply
 * their own `entity` and `action` values.
 */

import type { AuthorizationContext } from '../authorization/index.js';

/**
 * What happened. Kept coarse: the specific meaning lives in `entity`, and a
 * small closed set keeps the audit log queryable.
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'read'
  | 'login'
  | 'logout'
  | 'permission_grant'
  | 'permission_revoke'
  | 'approve'
  | 'reject'
  | 'issue'
  | 'publish'
  | 'export';

/**
 * A recorded change. Every field is readonly: an audit event is a statement
 * about the past, and the type should make amending one awkward.
 */
export interface AuditEvent {
  readonly entity: string;
  readonly entityId: string;
  readonly action: AuditAction;

  readonly actorId: string | null;
  readonly actorKind: AuthorizationContext['actorKind'];
  readonly organizationId: string | null;
  readonly sessionId: string | null;

  readonly requestId: string;
  readonly occurredAt: Date;

  readonly ipAddress: string | null;
  readonly userAgent: string | null;

  /**
   * State before and after, for change reconstruction. Both are null for reads
   * and for creates/deletes respectively. Redact before passing them in — see
   * `redactAuditValues`.
   */
  readonly previousValues: Readonly<Record<string, unknown>> | null;
  readonly newValues: Readonly<Record<string, unknown>> | null;

  /** Non-authoritative context, e.g. the reason given for an approval. */
  readonly metadata: Readonly<Record<string, unknown>> | null;
}

/**
 * Where audit events go. Implementations must be append-only.
 *
 * `record` returns a promise but callers should not depend on durability before
 * responding: see `AuditRecorder` for the flushing contract.
 */
export interface AuditSink {
  record(event: AuditEvent): Promise<void>;
}

export interface AuditEventInput {
  readonly entity: string;
  readonly entityId: string;
  readonly action: AuditAction;
  readonly previousValues?: Record<string, unknown> | null;
  readonly newValues?: Record<string, unknown> | null;
  readonly metadata?: Record<string, unknown> | null;
}

/**
 * Field names whose values are never written to the audit log, matched
 * case-insensitively against the whole key.
 *
 * The audit log is widely readable by administrators and retained far longer
 * than most data, so a secret written here is a secret that outlives every
 * rotation policy.
 */
const REDACTED_KEYS: ReadonlySet<string> = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'sessiontoken',
  'session_token',
  'mfasecret',
  'mfa_secret',
  'totpsecret',
  'totp_secret',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
]);

export const REDACTED_PLACEHOLDER = '[redacted]';

/**
 * Replace sensitive values with a placeholder, preserving the key so the audit
 * log still shows *that* a field changed without disclosing what it changed to.
 */
export function redactAuditValues(
  values: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (values == null) return null;

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    redacted[key] = REDACTED_KEYS.has(key.toLowerCase())
      ? REDACTED_PLACEHOLDER
      : value;
  }

  return redacted;
}

/**
 * Reduce a before/after pair to only the fields that actually changed.
 *
 * Storing whole rows makes the log expensive and its diffs unreadable; storing
 * only the delta is what makes "what did this look like before" answerable at a
 * glance. Comparison is shallow and reference-based for objects, which is
 * correct for column values.
 */
export function diffAuditValues(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined,
): {
  previousValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
} {
  if (previous == null || next == null) {
    return {
      previousValues: redactAuditValues(previous),
      newValues: redactAuditValues(next),
    };
  }

  const changedBefore: Record<string, unknown> = {};
  const changedAfter: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    if (!Object.is(previous[key], next[key])) {
      changedBefore[key] = previous[key];
      changedAfter[key] = next[key];
    }
  }

  if (Object.keys(changedAfter).length === 0) {
    return { previousValues: null, newValues: null };
  }

  return {
    previousValues: redactAuditValues(changedBefore),
    newValues: redactAuditValues(changedAfter),
  };
}

/**
 * Builds fully-populated audit events from a context plus the domain-specific
 * part, so no call site has to remember to attach the actor, request id or
 * client metadata — the fields most likely to be forgotten and least likely to
 * be noticed as missing.
 */
export class AuditRecorder {
  private readonly sink: AuditSink;
  private readonly now: () => Date;

  constructor(sink: AuditSink, now: () => Date = () => new Date()) {
    this.sink = sink;
    this.now = now;
  }

  build(context: AuthorizationContext, input: AuditEventInput): AuditEvent {
    return {
      entity: input.entity,
      entityId: input.entityId,
      action: input.action,

      actorId: context.userId ?? null,
      actorKind: context.actorKind,
      organizationId: context.organizationId ?? null,
      sessionId: context.sessionId ?? null,

      requestId: context.metadata.requestId,
      occurredAt: this.now(),

      ipAddress: context.metadata.ipAddress ?? null,
      userAgent: context.metadata.userAgent ?? null,

      previousValues: redactAuditValues(input.previousValues),
      newValues: redactAuditValues(input.newValues),
      metadata: input.metadata ?? null,
    };
  }

  async record(
    context: AuthorizationContext,
    input: AuditEventInput,
  ): Promise<void> {
    await this.sink.record(this.build(context, input));
  }
}

/**
 * Collects events in memory. For tests and local development only.
 *
 * Tests should assert against `events` rather than against a log transport,
 * which is what makes "every mutating operation is audited" a checkable claim.
 */
export class InMemoryAuditSink implements AuditSink {
  private readonly recorded: AuditEvent[] = [];

  record(event: AuditEvent): Promise<void> {
    this.recorded.push(event);
    return Promise.resolve();
  }

  get events(): readonly AuditEvent[] {
    return this.recorded;
  }

  eventsFor(entity: string, entityId?: string): readonly AuditEvent[] {
    return this.recorded.filter(
      (event) =>
        event.entity === entity &&
        (entityId === undefined || event.entityId === entityId),
    );
  }

  clear(): void {
    this.recorded.length = 0;
  }
}
