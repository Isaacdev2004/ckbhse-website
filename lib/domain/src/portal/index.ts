/** Portal workspace domain types (M2.4). */

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type DocumentStatus = 'active' | 'archived' | 'expired';

export type ActionStatus = 'open' | 'in_progress' | 'overdue' | 'completed';

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'reported'
  | 'investigating'
  | 'corrective_action'
  | 'closed';

export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'awaiting_client'
  | 'resolved'
  | 'closed';

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type CertificateType =
  | 'iso'
  | 'training'
  | 'compliance'
  | 'inspection'
  | 'audit';

export type OrganizationMemberStatus =
  | 'invited'
  | 'active'
  | 'suspended'
  | 'deactivated';

export type ActivityKind =
  | 'auth'
  | 'project'
  | 'document'
  | 'training'
  | 'audit'
  | 'incident'
  | 'message'
  | 'support'
  | 'profile'
  | 'system';

export interface PortalProject {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: ProjectStatus;
  readonly progressPercent: number;
  readonly startDate: Date | null;
  readonly endDate: Date | null;
  readonly consultantId: string | null;
  readonly serviceType: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PortalDocument {
  readonly id: string;
  readonly organizationId: string;
  readonly folderId: string | null;
  readonly name: string;
  readonly category: string | null;
  readonly tags: readonly string[];
  readonly storageKey: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  readonly ownerUserId: string | null;
  readonly expiresAt: Date | null;
  readonly status: DocumentStatus;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PortalCertificate {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly certificateType: CertificateType;
  readonly issuedAt: Date;
  readonly expiresAt: Date | null;
  readonly verificationStatus: string;
  readonly storageKey: string | null;
  readonly createdAt: Date;
}

export interface PortalAction {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: ActionStatus;
  readonly priority: ActionPriority;
  readonly ownerUserId: string | null;
  readonly dueDate: Date | null;
  readonly completedAt: Date | null;
  readonly createdAt: Date;
}

export interface PortalIncident {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly description: string | null;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly ownerUserId: string | null;
  readonly reportedAt: Date;
  readonly closedAt: Date | null;
  readonly createdAt: Date;
}

export interface PortalAudit {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly auditorId: string | null;
  readonly scheduledAt: Date;
  readonly completedAt: Date | null;
  readonly status: AuditStatus;
  readonly score: number | null;
  readonly reportStorageKey: string | null;
  readonly createdAt: Date;
}

export interface SupportTicket {
  readonly id: string;
  readonly organizationId: string;
  readonly subject: string;
  readonly category: string | null;
  readonly priority: SupportTicketPriority;
  readonly status: SupportTicketStatus;
  readonly requesterUserId: string;
  readonly assigneeUserId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PortalMessage {
  readonly id: string;
  readonly organizationId: string;
  readonly threadId: string;
  readonly senderUserId: string;
  readonly body: string;
  readonly isInternal: boolean;
  readonly createdAt: Date;
}

export interface PortalActivity {
  readonly id: string;
  readonly organizationId: string;
  readonly kind: ActivityKind;
  readonly summary: string;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly actorUserId: string | null;
  readonly occurredAt: Date;
}

export interface OrganizationProfile {
  readonly organizationId: string;
  readonly registrationNumber: string | null;
  readonly industry: string | null;
  readonly primaryContactName: string | null;
  readonly primaryContactEmail: string | null;
  readonly secondaryContacts: readonly Record<string, unknown>[];
  readonly address: Record<string, unknown> | null;
  readonly locations: readonly Record<string, unknown>[];
  readonly accountTier: string | null;
  readonly subscription: string | null;
  readonly renewalDate: Date | null;
  readonly assignedConsultantId: string | null;
  readonly primaryAuditorId: string | null;
  readonly trainingManagerId: string | null;
  readonly complianceManagerId: string | null;
  readonly logoUrl: string | null;
  readonly accreditations: readonly string[];
  readonly riskProfile: string | null;
  readonly healthScore: number | null;
  readonly complianceScore: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface OrganizationMember {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly department: string | null;
  readonly site: string | null;
  readonly status: OrganizationMemberStatus;
  readonly invitedAt: Date | null;
  readonly joinedAt: Date | null;
}
