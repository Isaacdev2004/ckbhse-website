import { describe, expect, it } from 'vitest';
import { FileContentLoader } from '@workspace/content/loader';
import { collectCmsImportRecords } from './cms-import.js';

describe('collectCmsImportRecords', () => {
  it('collects hub, service, and legal records from the file loader', () => {
    const records = collectCmsImportRecords(new FileContentLoader());
    expect(records.length).toBeGreaterThan(50);
    expect(records.some((row) => row.contentType === 'home' && row.path === '/')).toBe(true);
    expect(records.some((row) => row.contentType === 'service')).toBe(true);
    expect(records.some((row) => row.contentType === 'case_study' && row.requiresClientApproval)).toBe(
      true,
    );
    expect(records.some((row) => row.slug === 'privacy-policy')).toBe(true);
  });
});
