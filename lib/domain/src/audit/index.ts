/** Compliance audit platform domain types (M2.6). */

export type ComplianceAuditStatus =
  | 'draft'
  | 'scheduled'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'published'
  | 'closed'
  | 'archived'
  | 'cancelled';

export type AuditAssignmentRole =
  | 'lead_auditor'
  | 'co_auditor'
  | 'observer'
  | 'technical_expert'
  | 'client_representative'
  | 'site_contact';

export type ChecklistItemType =
  | 'pass_fail'
  | 'yes_no'
  | 'compliant_non_compliant'
  | 'numeric'
  | 'percentage'
  | 'rating'
  | 'free_text'
  | 'multiple_choice'
  | 'single_choice'
  | 'photo_upload'
  | 'document_upload'
  | 'signature'
  | 'gps_location'
  | 'date'
  | 'time';

export type FindingSeverity = 'observation' | 'minor' | 'major' | 'critical';

export type FindingStatus = 'open' | 'in_progress' | 'closed' | 'verified';

export type ScoringModel =
  | 'percentage'
  | 'weighted'
  | 'pass_fail'
  | 'risk_weighted'
  | 'compliance_index';

export interface AuditType {
  readonly id: string;
  readonly organizationId: string | null;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
  readonly isActive: boolean;
}

export interface ComplianceAudit {
  readonly id: string;
  readonly organizationId: string;
  readonly auditTypeId: string | null;
  readonly templateId: string | null;
  readonly templateVersion: number | null;
  readonly name: string;
  readonly site: string | null;
  readonly department: string | null;
  readonly standard: string | null;
  readonly scope: string | null;
  readonly objectives: string | null;
  readonly criteria: string | null;
  readonly leadAuditorId: string | null;
  readonly plannedStart: Date | null;
  readonly plannedEnd: Date | null;
  readonly status: ComplianceAuditStatus;
  readonly score: number | null;
  readonly scoringModel: ScoringModel;
  readonly priority: string;
  readonly riskRating: string | null;
  readonly isImmutable: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AuditFinding {
  readonly id: string;
  readonly auditId: string;
  readonly organizationId: string;
  readonly title: string;
  readonly description: string | null;
  readonly severity: FindingSeverity;
  readonly status: FindingStatus;
  readonly category: string | null;
  readonly clauseReference: string | null;
  readonly dueDate: Date | null;
}

export interface AuditTemplate {
  readonly id: string;
  readonly organizationId: string;
  readonly auditTypeId: string | null;
  readonly name: string;
  readonly description: string | null;
  readonly version: number;
  readonly scoringModel: ScoringModel;
  readonly isActive: boolean;
}

export interface AuditTemplateItem {
  readonly id: string;
  readonly sectionId: string;
  readonly templateId: string;
  readonly itemType: ChecklistItemType;
  readonly prompt: string;
  readonly guidance: string | null;
  readonly isRequired: boolean;
  readonly requiresEvidence: boolean;
  readonly weight: number;
  readonly sortOrder: number;
}

export interface AuditEvidence {
  readonly id: string;
  readonly auditId: string;
  readonly organizationId: string;
  readonly findingId: string | null;
  readonly storageKey: string | null;
  readonly fileName: string | null;
  readonly notes: string | null;
  readonly capturedAt: Date;
}
