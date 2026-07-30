/** CAPA platform domain types (M2.6 Part 2B.1). */

export type CapaType = 'corrective' | 'preventive';

export type CapaStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'pending_verification'
  | 'pending_approval'
  | 'approved'
  | 'closed'
  | 'cancelled'
  | 'overdue';

export type CapaPriority = 'low' | 'medium' | 'high' | 'critical';

export type RcaMethod =
  | 'five_whys'
  | 'fishbone'
  | 'fault_tree'
  | 'barrier_analysis'
  | 'other';

export type VerificationResult = 'pending' | 'effective' | 'ineffective' | 'partial';

export interface CapaRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly capaNumber: string;
  readonly title: string;
  readonly description: string | null;
  readonly capaType: CapaType;
  readonly status: CapaStatus;
  readonly priority: CapaPriority;
  readonly dueDate: Date | null;
  readonly site: string | null;
  readonly department: string | null;
}

export interface CapaRootCauseAnalysis {
  readonly id: string;
  readonly capaId: string;
  readonly method: RcaMethod;
  readonly summary: string | null;
  readonly rootCauses: readonly string[];
}

export interface CapaVerification {
  readonly id: string;
  readonly capaId: string;
  readonly result: VerificationResult;
  readonly notes: string | null;
  readonly verifiedAt: Date | null;
}

export interface CapaApproval {
  readonly id: string;
  readonly capaId: string;
  readonly approvalLevel: number;
  readonly status: string;
  readonly approvedAt: Date | null;
}

export interface CapaEscalation {
  readonly id: string;
  readonly capaId: string;
  readonly escalationLevel: number;
  readonly reason: string;
  readonly escalatedAt: Date;
}
