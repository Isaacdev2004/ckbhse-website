import type { SessionId, UserId } from '@workspace/domain/shared';
import type {
  CreateSessionInput,
  RenewSessionInput,
  Session,
} from './session.interface.js';

/**
 * Persistence contract for server-side sessions.
 *
 * Implementations must support immediate revocation — the primary reason
 * sessions live in PostgreSQL rather than stateless JWTs for browser clients.
 */
export interface SessionStore {
  /** Persist a newly authenticated session and return the stored row. */
  create(input: CreateSessionInput): Promise<Session>;

  /** Fetch a session by id, or `null` when no row exists. */
  findById(id: SessionId): Promise<Session | null>;

  /** List active sessions for account-security and admin tooling. */
  findActiveByUserId(userId: UserId): Promise<readonly Session[]>;

  /** Apply a sliding-window renewal after authenticated activity. */
  renew(id: SessionId, input: RenewSessionInput): Promise<Session>;

  /** Mark a single session revoked. Idempotent when already revoked. */
  revoke(id: SessionId): Promise<void>;

  /** Revoke every active session for a user (password reset, suspend, etc.). */
  revokeAllForUser(userId: UserId): Promise<void>;

  /** Delete or mark expired sessions past their absolute expiry. */
  purgeExpired(before: Date): Promise<number>;
}
