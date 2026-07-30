/**
 * File malware and content inspection abstraction.
 *
 * Production can plug in ClamAV, cloud scanning, or a vendor API. Local/dev
 * uses content inspection (magic bytes) to reject mismatched or executable payloads.
 */

export interface FileScanInput {
  readonly storageKey: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly body: Uint8Array;
}

export interface FileScanResult {
  readonly clean: boolean;
  readonly reason?: string;
  readonly scanner: string;
}

export interface FileScanProvider {
  readonly name: string;
  scan(input: FileScanInput): Promise<FileScanResult>;
}

/** Accepts all files — tests only. */
export class NoOpFileScanProvider implements FileScanProvider {
  readonly name = 'noop';

  scan(): Promise<FileScanResult> {
    return Promise.resolve({ clean: true, scanner: this.name });
  }
}

const MAGIC_SIGNATURES: ReadonlyArray<{
  readonly mimeTypes: readonly string[];
  readonly prefix: readonly number[];
}> = [
  { mimeTypes: ['application/pdf'], prefix: [0x25, 0x50, 0x44, 0x46] },
  { mimeTypes: ['image/png'], prefix: [0x89, 0x50, 0x4e, 0x47] },
  { mimeTypes: ['image/jpeg'], prefix: [0xff, 0xd8, 0xff] },
  { mimeTypes: ['image/gif'], prefix: [0x47, 0x49, 0x46] },
  { mimeTypes: ['image/webp'], prefix: [0x52, 0x49, 0x46, 0x46] },
];

const BLOCKED_PREFIXES: ReadonlyArray<readonly number[]> = [
  [0x3c, 0x21, 0x44, 0x4f], // <!DO — HTML
  [0x3c, 0x68, 0x74, 0x6d], // <htm
  [0x3c, 0x73, 0x76, 0x67], // <svg
  [0x4d, 0x5a], // MZ — Windows executable
  [0x7f, 0x45, 0x4c, 0x46], // ELF
];

function hasPrefix(body: Uint8Array, prefix: readonly number[]): boolean {
  if (body.byteLength < prefix.length) {
    return false;
  }
  return prefix.every((byte, index) => body[index] === byte);
}

function matchesDeclaredType(contentType: string, body: Uint8Array): boolean {
  if (contentType.startsWith('text/')) {
    return true;
  }

  const rule = MAGIC_SIGNATURES.find((entry) => entry.mimeTypes.includes(contentType));
  if (rule === undefined) {
    return true;
  }

  return hasPrefix(body, rule.prefix);
}

/**
 * Inspects file headers and blocks obvious executable/HTML payloads.
 * Not a substitute for antivirus — satisfies the upload gate until AV is wired.
 */
export class ContentInspectionScanProvider implements FileScanProvider {
  readonly name = 'content-inspection';

  async scan(input: FileScanInput): Promise<FileScanResult> {
    if (input.body.byteLength === 0) {
      return { clean: false, reason: 'empty payload', scanner: this.name };
    }

    for (const blocked of BLOCKED_PREFIXES) {
      if (hasPrefix(input.body, blocked)) {
        return {
          clean: false,
          reason: 'blocked file signature',
          scanner: this.name,
        };
      }
    }

    if (!matchesDeclaredType(input.contentType, input.body)) {
      return {
        clean: false,
        reason: 'content type does not match file signature',
        scanner: this.name,
      };
    }

    return { clean: true, scanner: this.name };
  }
}

export function createFileScanProviderFromEnv(
  env: Record<string, string | undefined> = process.env,
): FileScanProvider {
  const mode = (env.FILE_SCAN_PROVIDER ?? 'content-inspection').toLowerCase();
  if (mode === 'noop') {
    return new NoOpFileScanProvider();
  }
  return new ContentInspectionScanProvider();
}
