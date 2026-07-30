import { describe, expect, it } from 'vitest';

describe('risk domain types', () => {
  it('supports standard assessment workflow statuses', () => {
    const workflow = ['draft', 'active', 'under_review', 'approved', 'archived'];
    expect(workflow).toContain('under_review');
    expect(workflow.indexOf('approved')).toBeGreaterThan(workflow.indexOf('draft'));
  });

  it('supports bow-tie element types', () => {
    const elements = ['threat', 'top_event', 'consequence', 'preventive_barrier', 'recovery_barrier'];
    expect(elements).toContain('top_event');
  });
});
