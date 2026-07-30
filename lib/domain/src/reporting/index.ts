/** Cross-platform reporting domain types (M2.8). */

export type ReportingDomain =
  | 'compliance'
  | 'audit'
  | 'crm'
  | 'learning'
  | 'financial'
  | 'platform';

export type ReportingKpiUnit =
  | 'percent'
  | 'count'
  | 'score'
  | 'hours'
  | 'currency'
  | 'ratio';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface KpiDefinition {
  readonly key: string;
  readonly domain: ReportingDomain;
  readonly label: string;
  readonly unit: ReportingKpiUnit;
  readonly description?: string;
}

export interface KpiReading {
  readonly key: string;
  readonly domain: ReportingDomain;
  readonly label: string;
  readonly value: number;
  readonly unit: ReportingKpiUnit;
  readonly metadata?: Record<string, unknown>;
}

export interface KpiSnapshotSummary {
  readonly snapshotPeriod: string;
  readonly domain: ReportingDomain;
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: ReportingKpiUnit;
  readonly trendDirection: TrendDirection;
  readonly trendDelta: number;
  readonly updatedAt: string;
}

export interface ExecutiveSummaryData {
  readonly snapshotPeriod: string;
  readonly overallScore: number;
  readonly trendDirection: TrendDirection;
  readonly trendDelta: number;
  readonly domains: readonly {
    readonly domain: ReportingDomain;
    readonly score: number;
    readonly kpiCount: number;
  }[];
  readonly highlights: readonly KpiSnapshotSummary[];
}

export interface ReportingViewStatus {
  readonly viewKey: string;
  readonly description: string | null;
  readonly lastRefreshedAt: string | null;
  readonly refreshStatus: 'idle' | 'running' | 'failed';
  readonly rowCount: number;
}

export interface ReportDefinitionSummary {
  readonly id: string;
  readonly reportKey: string;
  readonly title: string;
  readonly domain: ReportingDomain;
  readonly updatedAt: string;
}

export type ReportSourceType = 'kpi' | 'executive';

export interface ReportDefinitionSpec {
  readonly sourceType: ReportSourceType;
  readonly columns?: readonly string[];
  readonly filters?: {
    readonly domain?: ReportingDomain;
    readonly kpiKeys?: readonly string[];
    readonly snapshotPeriod?: string;
  };
}

export interface ReportDefinitionDetail extends ReportDefinitionSummary {
  readonly definition: ReportDefinitionSpec;
  readonly createdBy: string | null;
  readonly createdAt: string;
}

export interface ReportExecutionColumn {
  readonly key: string;
  readonly label: string;
}

export interface ReportExecutionResult {
  readonly reportKey: string;
  readonly title: string;
  readonly sourceType: ReportSourceType;
  readonly snapshotPeriod: string | null;
  readonly columns: readonly ReportExecutionColumn[];
  readonly rows: readonly Record<string, unknown>[];
  readonly rowCount: number;
  readonly executedAt: string;
}

export interface CreateReportDefinitionInput {
  readonly reportKey: string;
  readonly title: string;
  readonly domain: ReportingDomain;
  readonly definition: ReportDefinitionSpec;
}

export interface UpdateReportDefinitionInput {
  readonly title?: string;
  readonly domain?: ReportingDomain;
  readonly definition?: ReportDefinitionSpec;
}

export type ReportExportFormat = 'csv' | 'xlsx' | 'pdf';

export type ReportExportStatus = 'pending' | 'processing' | 'ready' | 'failed';

export type ReportScheduleCadence = 'daily' | 'weekly' | 'monthly';

export interface ReportExportJobSummary {
  readonly id: string;
  readonly reportKey: string;
  readonly format: ReportExportFormat;
  readonly status: ReportExportStatus;
  readonly fileKey: string | null;
  readonly errorMessage: string | null;
  readonly completedAt: string | null;
  readonly createdAt: string;
}

export interface ReportExportDownload {
  readonly jobId: string;
  readonly downloadUrl: string;
  readonly expiresInSeconds: number;
  readonly contentType: string;
  readonly filename: string;
}

export interface ReportScheduleSummary {
  readonly id: string;
  readonly scheduleKey: string;
  readonly reportKey: string;
  readonly title: string;
  readonly cadence: ReportScheduleCadence;
  readonly timeUtc: string;
  readonly format: ReportExportFormat;
  readonly recipients: readonly string[];
  readonly enabled: boolean;
  readonly lastRunAt: string | null;
  readonly nextRunAt: string | null;
  readonly updatedAt: string;
}

export interface CreateReportScheduleInput {
  readonly scheduleKey: string;
  readonly reportKey: string;
  readonly title: string;
  readonly cadence: ReportScheduleCadence;
  readonly timeUtc: string;
  readonly format: ReportExportFormat;
  readonly recipients?: readonly string[];
  readonly enabled?: boolean;
}

export interface UpdateReportScheduleInput {
  readonly title?: string;
  readonly cadence?: ReportScheduleCadence;
  readonly timeUtc?: string;
  readonly format?: ReportExportFormat;
  readonly recipients?: readonly string[];
  readonly enabled?: boolean;
}

export type DashboardWidgetType =
  | 'metric'
  | 'trend'
  | 'table'
  | 'chart'
  | 'heatmap'
  | 'benchmark';

export interface WidgetCatalogEntry {
  readonly type: DashboardWidgetType;
  readonly label: string;
  readonly description: string;
}

export interface DashboardLayoutItem {
  readonly widgetKey: string;
  readonly order: number;
  readonly visible: boolean;
  readonly colSpan: number;
}

export interface DashboardSummary {
  readonly dashboardKey: string;
  readonly title: string;
  readonly description: string | null;
  readonly domain: ReportingDomain | null;
  readonly isDefault: boolean;
}

export interface DashboardWidgetDefinition {
  readonly widgetKey: string;
  readonly widgetType: DashboardWidgetType;
  readonly title: string;
  readonly config: Record<string, unknown>;
  readonly defaultOrder: number;
  readonly colSpan: number;
}

export interface ResolvedDashboardWidget extends DashboardWidgetDefinition {
  readonly order: number;
  readonly visible: boolean;
  readonly data: unknown;
}

export interface DashboardView {
  readonly dashboardKey: string;
  readonly title: string;
  readonly description: string | null;
  readonly domain: ReportingDomain | null;
  readonly snapshotPeriod: string | null;
  readonly widgets: readonly ResolvedDashboardWidget[];
  readonly layout: readonly DashboardLayoutItem[];
}

export interface UserDashboardLayout {
  readonly dashboardKey: string;
  readonly layout: readonly DashboardLayoutItem[];
  readonly updatedAt: string;
}

export type BiExportType = 'full' | 'incremental';

export type BiExportStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface BiConnectionSummary {
  readonly id: string;
  readonly connectionKey: string;
  readonly provider: string;
  readonly workspaceId: string;
  readonly datasetName: string;
  readonly datasetKey: string;
  readonly enabled: boolean;
  readonly lastSyncAt: string | null;
  readonly updatedAt: string;
}

export interface CreateBiConnectionInput {
  readonly connectionKey: string;
  readonly workspaceId: string;
  readonly datasetName: string;
  readonly datasetKey: string;
  readonly enabled?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface UpdateBiConnectionInput {
  readonly workspaceId?: string;
  readonly datasetName?: string;
  readonly datasetKey?: string;
  readonly enabled?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface BiExportJobSummary {
  readonly id: string;
  readonly connectionKey: string;
  readonly datasetKey: string;
  readonly exportType: BiExportType;
  readonly status: BiExportStatus;
  readonly fileKey: string | null;
  readonly rowCount: number;
  readonly watermark: Record<string, unknown>;
  readonly errorMessage: string | null;
  readonly completedAt: string | null;
  readonly createdAt: string;
}

export interface BiExportDownload {
  readonly exportId: string;
  readonly downloadUrl: string;
  readonly expiresInSeconds: number;
  readonly contentType: string;
  readonly filename: string;
}

export interface BiIncrementalManifest {
  readonly connectionKey: string;
  readonly datasetKey: string;
  readonly refreshMode: 'full' | 'incremental';
  readonly watermark: Record<string, unknown>;
  readonly tables: readonly {
    readonly name: string;
    readonly primaryKey: readonly string[];
    readonly incrementalColumn: string;
  }[];
  readonly lastExportAt: string | null;
}

export interface BenchmarkCohortSummary {
  readonly cohortKey: string;
  readonly label: string;
  readonly industry: string | null;
  readonly description: string | null;
}

export interface BenchmarkMetric {
  readonly cohortKey: string;
  readonly domain: ReportingDomain;
  readonly kpiKey: string;
  readonly percentile25: number;
  readonly percentile50: number;
  readonly percentile75: number;
  readonly sampleSize: number;
  readonly snapshotPeriod: string;
}

export interface BenchmarkComparisonItem {
  readonly kpiKey: string;
  readonly domain: ReportingDomain;
  readonly label: string;
  readonly organizationValue: number;
  readonly cohortMedian: number;
  readonly percentileRank: number;
  readonly gapToMedian: number;
  readonly performanceBand: 'below' | 'at' | 'above';
}

export interface BenchmarkComparisonResult {
  readonly cohortKey: string;
  readonly snapshotPeriod: string;
  readonly items: readonly BenchmarkComparisonItem[];
}

export type SeasonalityFlag = 'none' | 'possible' | 'likely';

export interface TrendAnalysisPoint {
  readonly snapshotPeriod: string;
  readonly value: number;
  readonly movingAverage: number | null;
}

export interface TrendAnalysisResult {
  readonly kpiKey: string;
  readonly domain: ReportingDomain;
  readonly label: string;
  readonly seasonalityFlag: SeasonalityFlag;
  readonly trendDirection: TrendDirection;
  readonly points: readonly TrendAnalysisPoint[];
}

export type ForecastConfidence = 'low' | 'medium' | 'high';

export interface ForecastSummary {
  readonly kpiKey: string;
  readonly domain: ReportingDomain;
  readonly label: string;
  readonly snapshotPeriod: string;
  readonly forecastPeriod: string;
  readonly projectedValue: number;
  readonly confidence: ForecastConfidence;
  readonly method: string;
  readonly riskOfBreach: boolean;
  readonly updatedAt: string;
}

export type ThresholdOperator = 'lt' | 'lte' | 'gt' | 'gte';

export type SubscriptionChannel = 'email' | 'in_app';

export interface KpiSubscriptionSummary {
  readonly id: string;
  readonly subscriptionKey: string;
  readonly kpiKey: string;
  readonly domain: ReportingDomain;
  readonly thresholdOperator: ThresholdOperator;
  readonly thresholdValue: number;
  readonly channel: SubscriptionChannel;
  readonly enabled: boolean;
  readonly lastTriggeredAt: string | null;
  readonly updatedAt: string;
}

export interface CreateKpiSubscriptionInput {
  readonly subscriptionKey: string;
  readonly kpiKey: string;
  readonly domain: ReportingDomain;
  readonly thresholdOperator: ThresholdOperator;
  readonly thresholdValue: number;
  readonly channel?: SubscriptionChannel;
  readonly enabled?: boolean;
}

export interface UpdateKpiSubscriptionInput {
  readonly thresholdOperator?: ThresholdOperator;
  readonly thresholdValue?: number;
  readonly channel?: SubscriptionChannel;
  readonly enabled?: boolean;
}

export interface SubscriptionEvaluationResult {
  readonly evaluated: number;
  readonly triggered: number;
  readonly triggeredKeys: readonly string[];
}
