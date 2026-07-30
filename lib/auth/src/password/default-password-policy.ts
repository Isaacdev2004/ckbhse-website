import type {
  PasswordEvaluationContext,
  PasswordPolicy,
  PasswordPolicyEvaluator,
  PasswordPolicyResult,
  PasswordPolicyViolation,
} from './password-policy.interface.js';

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  'qwerty123',
  'letmein',
  'admin123',
  'welcome123',
  'changeme',
]);

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  preventCommonPasswords: true,
  historyCount: 5,
};

export class DefaultPasswordPolicyEvaluator implements PasswordPolicyEvaluator {
  readonly policy: PasswordPolicy;

  constructor(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
    this.policy = policy;
  }

  evaluate(
    candidate: string,
    context?: PasswordEvaluationContext,
  ): PasswordPolicyResult {
    const violations: PasswordPolicyViolation[] = [];

    if (candidate.length < this.policy.minLength) {
      violations.push({
        code: 'too_short',
        message: `Password must be at least ${this.policy.minLength} characters`,
      });
    }

    if (candidate.length > this.policy.maxLength) {
      violations.push({
        code: 'too_long',
        message: `Password must be at most ${this.policy.maxLength} characters`,
      });
    }

    if (this.policy.requireUppercase && !/[A-Z]/.test(candidate)) {
      violations.push({
        code: 'missing_uppercase',
        message: 'Password must include an uppercase letter',
      });
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(candidate)) {
      violations.push({
        code: 'missing_lowercase',
        message: 'Password must include a lowercase letter',
      });
    }

    if (this.policy.requireDigit && !/\d/.test(candidate)) {
      violations.push({
        code: 'missing_digit',
        message: 'Password must include a digit',
      });
    }

    if (
      this.policy.requireSymbol &&
      !/[^A-Za-z0-9]/.test(candidate)
    ) {
      violations.push({
        code: 'missing_symbol',
        message: 'Password must include a symbol',
      });
    }

    if (
      this.policy.preventCommonPasswords &&
      COMMON_PASSWORDS.has(candidate.toLowerCase())
    ) {
      violations.push({
        code: 'common_password',
        message: 'Password is too common',
      });
    }

    if (
      context?.email !== undefined &&
      candidate.toLowerCase().includes(context.email.toLowerCase())
    ) {
      violations.push({
        code: 'contains_email',
        message: 'Password must not contain your email address',
      });
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }
}
