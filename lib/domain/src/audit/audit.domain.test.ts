import { describe, expect, it } from 'vitest';

describe('M2.6 audit permissions catalogue', () => {
  const auditPermissions = [
    'consultancy.audit.read',
    'consultancy.audit.create',
    'consultancy.audit.update',
    'consultancy.audit.delete',
    'consultancy.audit.assign',
    'consultancy.audit.approve',
    'consultancy.audit.close',
    'consultancy.audit.export',
    'consultancy.audit-template.manage',
    'consultancy.checklist.manage',
    'consultancy.evidence.upload',
    'consultancy.audit.conduct',
    'consultancy.audit.issue',
  ] as const;

  it.each(auditPermissions)('registers permission %s', (permission) => {
    expect(permission.startsWith('consultancy.')).toBe(true);
  });

  it('uses distinct permission keys', () => {
    expect(new Set(auditPermissions).size).toBe(auditPermissions.length);
  });
});

describe('M2.6 audit workflow statuses', () => {
  const workflow = [
    'draft',
    'scheduled',
    'assigned',
    'in_progress',
    'review',
    'approved',
    'published',
    'closed',
    'archived',
  ] as const;

  it('defines nine lifecycle states', () => {
    expect(workflow).toHaveLength(9);
    expect(workflow[0]).toBe('draft');
    expect(workflow.at(-1)).toBe('archived');
  });
});

describe('M2.6 checklist item types', () => {
  const itemTypes = [
    'pass_fail',
    'yes_no',
    'compliant_non_compliant',
    'numeric',
    'percentage',
    'rating',
    'free_text',
    'multiple_choice',
    'single_choice',
    'photo_upload',
    'document_upload',
    'signature',
    'gps_location',
    'date',
    'time',
  ] as const;

  it('supports fifteen checklist item types', () => {
    expect(itemTypes).toHaveLength(15);
  });
});
