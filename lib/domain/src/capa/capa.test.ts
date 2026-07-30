import { describe, expect, it } from 'vitest';
import type { CapaStatus, CapaType, VerificationResult } from './index.js';

const CAPA_TYPES: CapaType[] = ['corrective', 'preventive'];

const WORKFLOW_STATUSES: CapaStatus[] = [
  'draft',
  'open',
  'in_progress',
  'pending_verification',
  'pending_approval',
  'approved',
  'closed',
];

const VERIFICATION_RESULTS: VerificationResult[] = [
  'pending',
  'effective',
  'ineffective',
  'partial',
];

describe('CAPA domain types', () => {
  it('defines corrective and preventive action types', () => {
    expect(CAPA_TYPES).toContain('corrective');
    expect(CAPA_TYPES).toContain('preventive');
  });

  it('defines the primary workflow statuses', () => {
    expect(WORKFLOW_STATUSES).toContain('pending_verification');
    expect(WORKFLOW_STATUSES).toContain('pending_approval');
    expect(WORKFLOW_STATUSES.indexOf('closed')).toBeGreaterThan(
      WORKFLOW_STATUSES.indexOf('open'),
    );
  });

  it('defines verification result values', () => {
    expect(VERIFICATION_RESULTS).toContain('effective');
    expect(VERIFICATION_RESULTS).toContain('ineffective');
  });
});
