import { describe, expect, it } from 'vitest';
import { ContentInspectionScanProvider } from './scan-provider.js';

describe('ContentInspectionScanProvider', () => {
  const scanner = new ContentInspectionScanProvider();

  it('accepts a valid PDF header', async () => {
    const body = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const result = await scanner.scan({
      storageKey: 'org/test/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: body.byteLength,
      body,
    });
    expect(result.clean).toBe(true);
  });

  it('rejects HTML disguised as PDF', async () => {
    const body = new TextEncoder().encode('<html><body>x</body></html>');
    const result = await scanner.scan({
      storageKey: 'org/test/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: body.byteLength,
      body,
    });
    expect(result.clean).toBe(false);
  });

  it('rejects content type mismatch', async () => {
    const body = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const result = await scanner.scan({
      storageKey: 'org/test/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: body.byteLength,
      body,
    });
    expect(result.clean).toBe(false);
  });
});
