import { describe, expect, it } from 'vitest';
import {
  canTransitionLeadStatus,
  isOpenLeadStatus,
  isTerminalLeadStatus,
} from './lead-workflow.js';

describe('lead workflow', () => {
  it('allows new to acknowledged', () => {
    expect(canTransitionLeadStatus('new', 'acknowledged')).toBe(true);
  });

  it('blocks won to proposal_sent', () => {
    expect(canTransitionLeadStatus('won', 'proposal_sent')).toBe(false);
  });

  it('classifies terminal statuses', () => {
    expect(isTerminalLeadStatus('won')).toBe(true);
    expect(isOpenLeadStatus('qualified')).toBe(true);
  });
});
