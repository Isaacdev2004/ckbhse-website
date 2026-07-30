import { describe, expect, it } from 'vitest';
import {
  canTransitionContactRequestStatus,
  normaliseContactEmail,
  validateContactRequestInput,
} from './contact-request.js';

describe('contact request domain rules', () => {
  it('normalises email addresses', () => {
    expect(normaliseContactEmail('  Alex@Example.com ')).toBe(
      'alex@example.com',
    );
  });

  it('validates required enquiry fields', () => {
    expect(() =>
      validateContactRequestInput({
        firstName: 'Alex',
        lastName: 'Taylor',
        email: 'alex@example.com',
        serviceInterest: 'Consulting',
        message: 'Valid message with enough length.',
      }),
    ).not.toThrow();
  });

  it('rejects invalid email addresses', () => {
    expect(() =>
      validateContactRequestInput({
        firstName: 'Alex',
        lastName: 'Taylor',
        email: 'not-an-email',
        serviceInterest: 'Consulting',
        message: 'Valid message with enough length.',
      }),
    ).toThrow('A valid email address is required');
  });

  it('allows valid status transitions', () => {
    expect(canTransitionContactRequestStatus('received', 'triaged')).toBe(true);
    expect(canTransitionContactRequestStatus('closed', 'received')).toBe(false);
  });
});
