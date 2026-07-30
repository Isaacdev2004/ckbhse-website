import type {
  OrganizationId,
  SessionId,
  UserId,
} from '@workspace/domain/shared';

/**
 * Lifecycle state of a server-side session row.
 *
 * Sessions transition to `revoked` on explicit sign-out, credential rotation, or
 * administrative action; to `expired` when absolute or idle expiry elapses.
 */
export type SessionStatus = 'active' | 'revoked' | 'expired';

/**
 * A persisted authentication session.
 *
 * Browser clients authenticate via an HttpOnly session cookie whose value maps to
 * this record. The session carries tenant scope (`organizationId`) so every
 * downstream repository call inherits the correct partition without trusting
 * request parameters.
 */
export interface Session {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly status: SessionStatus;
  /** Hard upper bound after which the session cannot be renewed. */
  readonly expiresAt: Date;
  /** Sliding window; renewed on authenticated activity until `expiresAt`. */
  readonly idleExpiresAt: Date;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  /** Stable device identifier for trusted-device and session-management UI. */
  readonly deviceFingerprint: string | null;
  /** When true, idle expiry follows the extended remember-me policy. */
  readonly rememberMe: boolean;
  readonly createdAt: Date;
  readonly lastActivityAt: Date;
}

/** Input for creating a new session after successful authentication. */
export interface CreateSessionInput {
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
  readonly deviceFingerprint?: string | null;
  readonly rememberMe?: boolean;
}

/** Partial update applied when renewing an active session. */
export interface RenewSessionInput {
  readonly lastActivityAt: Date;
  readonly idleExpiresAt: Date;
}

/** Narrow unknown values to {@link SessionStatus}. */
export function isSessionStatus(value: unknown): value is SessionStatus {
  return (
    value === 'active' || value === 'revoked' || value === 'expired'
  );
}
