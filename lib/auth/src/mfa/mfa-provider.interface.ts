import type { UserId } from '@workspace/domain/shared';

/** Supported second-factor methods. */
export type MfaMethod = 'totp' | 'recovery_code' | 'webauthn' | 'sms';

/** Enrolment state for a user's MFA configuration. */
export interface MfaEnrolment {
  readonly userId: UserId;
  readonly method: MfaMethod;
  readonly enrolledAt: Date;
  readonly label: string | null;
  readonly isPrimary: boolean;
}

/** Result of initiating TOTP enrolment. */
export interface TotpEnrolmentChallenge {
  readonly secret: string;
  readonly otpauthUri: string;
  readonly recoveryCodes: readonly string[];
}

/** Challenge presented during login when MFA is required. */
export interface MfaVerificationChallenge {
  readonly challengeId: string;
  readonly userId: UserId;
  readonly allowedMethods: readonly MfaMethod[];
  readonly expiresAt: Date;
}

/** Input for completing an MFA step during login. */
export interface MfaVerificationInput {
  readonly challengeId: string;
  readonly method: MfaMethod;
  readonly code: string;
}

/**
 * Multi-factor authentication provider contract.
 *
 * Phase 1 targets TOTP and one-time recovery codes; additional methods attach
 * through the same interface without changing login orchestration.
 */
export interface MfaProvider {
  /** Begin TOTP enrolment for an authenticated user. */
  beginTotpEnrolment(userId: UserId): Promise<TotpEnrolmentChallenge>;

  /** Confirm TOTP enrolment with a valid code from the authenticator app. */
  confirmTotpEnrolment(userId: UserId, code: string): Promise<MfaEnrolment>;

  /** Start an MFA challenge after primary credential verification. */
  beginVerification(userId: UserId): Promise<MfaVerificationChallenge>;

  /** Complete MFA and return whether the factor was valid. */
  verify(input: MfaVerificationInput): Promise<boolean>;

  /** Disable MFA for a user (requires elevated authorization at call site). */
  disable(userId: UserId, method: MfaMethod): Promise<void>;

  /** List active enrolments for account-security UI. */
  listEnrolments(userId: UserId): Promise<readonly MfaEnrolment[]>;
}
