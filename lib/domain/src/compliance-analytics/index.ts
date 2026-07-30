/** Compliance analytics domain types (M2.6 Part 2B.3). */

export type RegulatoryAlertSeverity = 'info' | 'warning' | 'critical';

export type RegulatoryAlertStatus = 'open' | 'acknowledged' | 'resolved';

export type ComplianceExportFormat = 'csv' | 'json' | 'xlsx';

export interface ComplianceKpiSnapshot {
  readonly snapshotMonth: string;
  readonly complianceScore: number;
  readonly auditCompletion: number;
  readonly inspectionCompletion: number;
  readonly capaCompletion: number;
  readonly trainingCompletion: number;
  readonly controlEffectiveness: number;
  readonly openFindings: number;
}

export interface RegulatoryAlert {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly alertType: string;
  readonly severity: RegulatoryAlertSeverity;
  readonly status: RegulatoryAlertStatus;
}

export interface ExecutiveDashboardData {
  readonly complianceScore: number;
  readonly trendDirection: 'up' | 'down' | 'stable';
  readonly trendDelta: number;
  readonly kpis: readonly ComplianceKpiSnapshot[];
  readonly openAlerts: number;
  readonly criticalAlerts: number;
}
