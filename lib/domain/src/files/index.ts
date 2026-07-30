export type FileUploadStatus =
  | 'pending'
  | 'uploaded'
  | 'verified'
  | 'failed'
  | 'deleted';

export interface FileUploadSummary {
  readonly id: string;
  readonly organizationId: string;
  readonly storageKey: string;
  readonly originalFilename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly status: FileUploadStatus;
  readonly domain: string;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly createdAt: string;
}

export interface InitiateFileUploadInput {
  readonly originalFilename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly domain: string;
  readonly entityType?: string | null;
  readonly entityId?: string | null;
}

export interface InitiateFileUploadResult {
  readonly upload: FileUploadSummary;
  readonly uploadUrl: string;
  readonly expiresInSeconds: number;
}

export interface CompleteFileUploadResult {
  readonly upload: FileUploadSummary;
}

export interface FileDownloadGrant {
  readonly uploadId: string;
  readonly downloadUrl: string;
  readonly expiresInSeconds: number;
  readonly originalFilename: string;
  readonly contentType: string;
}
