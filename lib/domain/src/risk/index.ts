/** Risk management domain types (M2.6 Part 2B.2). */

export type RiskAssessmentStatus =
  | 'draft'
  | 'active'
  | 'under_review'
  | 'approved'
  | 'archived';

export type RiskAssessmentType =
  | 'general'
  | 'workplace'
  | 'project'
  | 'activity'
  | 'bowtie';

export type HazardCategory =
  | 'physical'
  | 'chemical'
  | 'biological'
  | 'ergonomic'
  | 'psychosocial'
  | 'environmental'
  | 'other';

export type HazardStatus =
  | 'identified'
  | 'assessed'
  | 'controlled'
  | 'monitored'
  | 'closed';

export type RiskTreatmentType =
  | 'eliminate'
  | 'substitute'
  | 'engineer'
  | 'administrative'
  | 'ppe'
  | 'transfer';

export type BowtieElementType =
  | 'threat'
  | 'top_event'
  | 'consequence'
  | 'preventive_barrier'
  | 'recovery_barrier';

export interface RiskMatrixLevel {
  readonly value: number;
  readonly label: string;
}

export interface RiskRatingThreshold {
  readonly min: number;
  readonly max: number;
  readonly rating: string;
  readonly color: string;
}

export interface RiskScore {
  readonly likelihood: number;
  readonly severity: number;
  readonly score: number;
  readonly rating: string;
}

export interface RiskHeatMapCell {
  readonly likelihood: number;
  readonly severity: number;
  readonly count: number;
  readonly rating: string;
}
