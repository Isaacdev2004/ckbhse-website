import { describe, expect, it } from 'vitest';
import {
  DefaultPasswordPolicyEvaluator,
  DEFAULT_PASSWORD_POLICY,
} from './default-password-policy.js';
import { isPasswordPolicyValid } from './password-policy.interface.js';

describe('DefaultPasswordPolicyEvaluator', () => {
  const evaluator = new DefaultPasswordPolicyEvaluator();

  it('accepts a strong password', () => {
    const result = evaluator.evaluate('StaffDev123!');
    expect(isPasswordPolicyValid(result)).toBe(true);
  });

  it('rejects passwords that are too short', () => {
    const result = evaluator.evaluate('Short1!');
    expect(isPasswordPolicyValid(result)).toBe(false);
    expect(result.violations.some((v) => v.code === 'too_short')).toBe(true);
  });

  it('rejects common passwords', () => {
    const result = evaluator.evaluate('password123');
    expect(isPasswordPolicyValid(result)).toBe(false);
  });

  it('rejects passwords containing the email address', () => {
    const result = evaluator.evaluate('user@example.com-Strong!', {
      email: 'user@example.com',
    });
    expect(isPasswordPolicyValid(result)).toBe(false);
  });

  it('uses the configured history count', () => {
    expect(DEFAULT_PASSWORD_POLICY.historyCount).toBe(5);
  });
});
