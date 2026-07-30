/** Outcome of evaluating a candidate password against policy rules. */
export interface PasswordPolicyResult {
  readonly valid: boolean;
  readonly violations: readonly PasswordPolicyViolation[];
}

/** A single failed policy rule with a user-safe explanation. */
export interface PasswordPolicyViolation {
  readonly code: PasswordPolicyViolationCode;
  readonly message: string;
}

export type PasswordPolicyViolationCode =
  | 'too_short'
  | 'too_long'
  | 'missing_uppercase'
  | 'missing_lowercase'
  | 'missing_digit'
  | 'missing_symbol'
  | 'common_password'
  | 'contains_email'
  | 'matches_previous';

/** Organisation-level password requirements. */
export interface PasswordPolicy {
  readonly minLength: number;
  readonly maxLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireDigit: boolean;
  readonly requireSymbol: boolean;
  readonly preventCommonPasswords: boolean;
  readonly historyCount: number;
}

/**
 * Validates candidate passwords before hashing.
 *
 * Callers use this at registration, password reset, and invitation acceptance so
 * weak passwords are rejected before they reach the hasher.
 */
export interface PasswordPolicyEvaluator {
  readonly policy: PasswordPolicy;
  evaluate(
    candidate: string,
    context?: PasswordEvaluationContext,
  ): PasswordPolicyResult;
}

/** Optional context used for contextual rules (e.g. must not contain email). */
export interface PasswordEvaluationContext {
  readonly email?: string;
  readonly previousHashes?: readonly string[];
}

/** Returns true when every rule passed. */
export function isPasswordPolicyValid(result: PasswordPolicyResult): boolean {
  return result.valid;
}
