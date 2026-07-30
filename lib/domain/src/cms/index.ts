export type CmsContentType =
  | 'site_config'
  | 'home'
  | 'hub'
  | 'corporate'
  | 'service'
  | 'industry'
  | 'course'
  | 'resource'
  | 'case_study'
  | 'testimonial'
  | 'client_success'
  | 'legal'
  | 'contact'
  | 'careers';

export type CmsEntryStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface CmsDashboardData {
  readonly totalEntries: number;
  readonly publishedEntries: number;
  readonly draftEntries: number;
  readonly archivedEntries: number;
  readonly pendingReviewEntries: number;
  readonly pendingClientApprovalEntries: number;
}

export interface CmsEntrySummary {
  readonly id: string;
  readonly contentType: CmsContentType;
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly status: CmsEntryStatus;
  readonly locale: string;
  readonly category: string | null;
  readonly segment: string | null;
  readonly publishedAt: string | null;
  readonly updatedAt: string;
  readonly requiresClientApproval: boolean;
  readonly versionNumber: number | null;
}

export interface CmsEntryVersionSummary {
  readonly id: string;
  readonly versionNumber: number;
  readonly changeSummary: string | null;
  readonly createdAt: string;
  readonly createdBy: string | null;
  readonly isPublished: boolean;
}

export interface CmsEntryDetail extends CmsEntrySummary {
  readonly seo: Record<string, unknown>;
  readonly reviewDueAt: string | null;
  readonly scheduledAt: string | null;
  readonly clientApprovedAt: string | null;
  readonly currentVersionId: string | null;
  readonly publishedVersionId: string | null;
  readonly payload: unknown;
  readonly versions: readonly CmsEntryVersionSummary[];
}

export interface CmsImportResult {
  readonly imported: number;
  readonly skipped: number;
  readonly errors: readonly string[];
}

export interface CreateCmsEntryInput {
  readonly contentType: CmsContentType;
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly locale?: string;
  readonly category?: string | null;
  readonly segment?: string | null;
  readonly seo?: Record<string, unknown>;
  readonly payload: unknown;
  readonly requiresClientApproval?: boolean;
  readonly changeSummary?: string | null;
}

export interface UpdateCmsDraftInput {
  readonly title?: string;
  readonly seo?: Record<string, unknown>;
  readonly payload: unknown;
  readonly changeSummary?: string | null;
}

export interface ScheduleCmsEntryInput {
  readonly scheduledAt: string;
  readonly reviewDueAt?: string | null;
}

export interface CmsWorkflowRunResult {
  readonly published: number;
  readonly reviewReminders: number;
  readonly errors: readonly string[];
}

export interface PublicContentEntry {
  readonly path: string;
  readonly contentType: CmsContentType;
  readonly slug: string;
  readonly title: string;
  readonly category: string | null;
  readonly segment: string | null;
  readonly seo: Record<string, unknown>;
  readonly payload: unknown;
  readonly publishedAt: string | null;
}

export interface CmsMediaAssetSummary {
  readonly id: string;
  readonly key: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly altText: string | null;
  readonly caption: string | null;
  readonly publicUrl: string;
  readonly usageCount: number;
  readonly createdAt: string;
}

export interface CmsSeoEntrySummary {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly contentType: CmsContentType;
  readonly status: CmsEntryStatus;
  readonly seo: Record<string, unknown>;
  readonly publishedAt: string | null;
}
