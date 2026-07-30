/** Compliance workspace domain types (M2.6 Part 2). */

export type InspectionStatus =
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'passed'
  | 'cancelled'
  | 'overdue';

export type InspectionFrequency =
  | 'unscheduled'
  | 'reactive'
  | 'preventive'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'follow_up'
  | 'spot';

export type LegalObligationStatus =
  | 'active'
  | 'pending_review'
  | 'superseded'
  | 'archived';

export type RegulatoryCategory =
  | 'hse'
  | 'iso'
  | 'environmental'
  | 'fire_safety'
  | 'construction'
  | 'manufacturing'
  | 'healthcare'
  | 'education'
  | 'public_sector';

export type ControlType =
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'administrative'
  | 'engineering'
  | 'operational';

export type ComplianceCalendarEventType =
  | 'audit'
  | 'inspection'
  | 'certification_renewal'
  | 'training_expiry'
  | 'legal_review'
  | 'policy_review'
  | 'risk_review'
  | 'equipment_inspection'
  | 'permit_renewal';

export interface Inspection {
  readonly id: string;
  readonly organizationId: string;
  readonly inspectionTypeId: string | null;
  readonly name: string;
  readonly site: string | null;
  readonly department: string | null;
  readonly frequency: InspectionFrequency;
  readonly status: InspectionStatus;
  readonly score: number | null;
  readonly scheduledAt: Date | null;
  readonly completedAt: Date | null;
}

export interface LegalRegisterEntry {
  readonly id: string;
  readonly organizationId: string;
  readonly regulation: string;
  readonly jurisdiction: string | null;
  readonly status: LegalObligationStatus;
  readonly reviewDate: Date | null;
}

export interface ComplianceControl {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly controlType: ControlType;
  readonly status: string;
  readonly frequency: string | null;
}

export interface ComplianceScoreConfig {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly scope: string;
  readonly weights: Record<string, number>;
}
