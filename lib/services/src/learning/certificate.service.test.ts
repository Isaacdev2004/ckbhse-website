import { describe, expect, it } from 'vitest';
import { CertificateService } from './certificate.service.js';
import { CPDService } from './cpd.service.js';
import { TranscriptService } from './transcript.service.js';

describe('CertificateService', () => {
  it('issues certificate with generated number', async () => {
    const service = new CertificateService({
      issue: async (_ctx: unknown, input: Record<string, unknown>) => ({ ...input, id: 'cert-1' }),
      list: async () => [],
      get: async () => null,
    } as never);

    const cert = await service.issue({ organizationId: 'org-1' } as never, {
      userId: 'user-1',
      courseCategory: 'health-safety',
      courseSlug: 'iosh',
    });
    expect(cert.certificateNumber).toMatch(/^CKBHSE-TRN-/);
  });
});

describe('CPDService', () => {
  it('records CPD hours', async () => {
    const service = new CPDService({
      create: async (_ctx: unknown, input: Record<string, unknown>) => input,
      list: async () => [],
      sumHours: async () => 0,
    } as never);

    const record = await service.record({ organizationId: 'org-1' } as never, {
      userId: 'user-1',
      category: 'Health & Safety',
      hours: 4,
    });
    expect(record.hours).toBe('4');
  });
});

describe('TranscriptService', () => {
  it('generates transcript summary', async () => {
    const service = new TranscriptService(
      { save: async () => ({}), get: async () => null } as never,
      { list: async () => [] } as never,
      { list: async () => [] } as never,
      { list: async () => [], sumHours: async () => 8 } as never,
    );

    const summary = await service.generate({
      userId: 'user-1',
      organizationId: 'org-1',
    } as never);
    expect(summary.cpdTotalHours).toBe(8);
  });
});
