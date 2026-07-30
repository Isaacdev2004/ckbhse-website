import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { ComplianceAnalyticsService } from '../compliance/analytics.js';
import type { DashboardService as CrmDashboardService } from '../crm/dashboard.service.js';
import type { LearningAnalyticsService } from '../learning/learning-analytics.service.js';
import type { RiskService } from '../risk/index.js';
import type { StorageProvider } from '@workspace/platform/storage';
import { createKpiEngineService } from './kpi-engine.service.js';
import { createReportingService } from './reporting.service.js';
import { createDashboardService } from './dashboard.service.js';
import { createReportBuilderService } from './report-builder.service.js';
import { createReportExportService } from './report-export.service.js';
import { createReportScheduleService } from './report-schedule.service.js';
import { createBiIntegrationService } from './bi-integration.service.js';
import { createBenchmarkService } from './benchmark.service.js';
import { createTrendAnalysisService } from './trend-analysis.service.js';
import { createPredictiveAnalyticsService } from './predictive-analytics.service.js';
import { createKpiSubscriptionService } from './kpi-subscription.service.js';
import {
  AuditKpiProvider,
  ComplianceKpiProvider,
  CrmKpiProvider,
  FinancialKpiProvider,
  LearningKpiProvider,
} from './providers/index.js';

export {
  KPI_REGISTRY,
  computeTrendDirection,
  definitionsForDomain,
  findKpiDefinition,
  snapshotPeriodKey,
} from './kpi-registry.js';
export {
  KpiEngineService,
  createKpiEngineService,
  REPORTING_KPI_REFRESH_JOB,
  type KpiRefreshResult,
} from './kpi-engine.service.js';
export {
  ReportingService,
  createReportingService,
} from './reporting.service.js';
export {
  DashboardService,
  createDashboardService,
} from './dashboard.service.js';
export {
  ReportBuilderService,
  createReportBuilderService,
} from './report-builder.service.js';
export {
  ReportExportService,
  createReportExportService,
} from './report-export.service.js';
export {
  ReportScheduleService,
  createReportScheduleService,
  computeNextRunAt,
  REPORT_SCHEDULE_DELIVERY_JOB,
} from './report-schedule.service.js';
export {
  BiIntegrationService,
  createBiIntegrationService,
} from './bi-integration.service.js';
export {
  BenchmarkService,
  createBenchmarkService,
} from './benchmark.service.js';
export {
  TrendAnalysisService,
  createTrendAnalysisService,
} from './trend-analysis.service.js';
export {
  PredictiveAnalyticsService,
  createPredictiveAnalyticsService,
} from './predictive-analytics.service.js';
export {
  KpiSubscriptionService,
  createKpiSubscriptionService,
  REPORTING_SUBSCRIPTION_EVAL_JOB,
} from './kpi-subscription.service.js';
export { formatReportCsv, formatReportPdf, formatReportExport } from './report-export.formatters.js';
export {
  assertExportWithinLimit,
  isViewRefreshStale,
  KPI_REFRESH_SLA_MS,
  MAX_BI_EXPORT_ROWS,
  MAX_REPORT_EXPORT_ROWS,
  VIEW_REFRESH_STALE_HOURS,
} from './reporting-limits.js';
export { WIDGET_CATALOG } from './widget-catalog.js';
export {
  ComplianceKpiProvider,
  AuditKpiProvider,
  CrmKpiProvider,
  LearningKpiProvider,
  FinancialKpiProvider,
  type KpiProvider,
} from './providers/index.js';

export interface ReportingServices {
  readonly reporting: ReturnType<typeof createReportingService>;
  readonly kpiEngine: ReturnType<typeof createKpiEngineService>;
  readonly dashboard: ReturnType<typeof createDashboardService>;
  readonly reportBuilder: ReturnType<typeof createReportBuilderService>;
  readonly reportExport: ReturnType<typeof createReportExportService>;
  readonly reportSchedule: ReturnType<typeof createReportScheduleService>;
  readonly biIntegration: ReturnType<typeof createBiIntegrationService>;
  readonly benchmark: ReturnType<typeof createBenchmarkService>;
  readonly trendAnalysis: ReturnType<typeof createTrendAnalysisService>;
  readonly predictiveAnalytics: ReturnType<typeof createPredictiveAnalyticsService>;
  readonly kpiSubscription: ReturnType<typeof createKpiSubscriptionService>;
}

export function createReportingServices(deps: {
  reporting: ReportingRepository;
  complianceAnalytics: ComplianceAnalyticsService;
  audit: AuditRepository;
  crmDashboard: CrmDashboardService;
  learningAnalytics: LearningAnalyticsService;
  riskService: RiskService | null;
  storage: StorageProvider;
}): ReportingServices {
  const providers = [
    new ComplianceKpiProvider(deps.complianceAnalytics),
    new AuditKpiProvider(deps.audit),
    new CrmKpiProvider(deps.crmDashboard),
    new LearningKpiProvider(deps.learningAnalytics),
    new FinancialKpiProvider(),
  ];

  const kpiEngine = createKpiEngineService({
    reporting: deps.reporting,
    providers,
  });

  const reporting = createReportingService({
    reporting: deps.reporting,
    kpiEngine,
  });

  const dashboard = createDashboardService({
    reporting: deps.reporting,
    reportingService: reporting,
    riskService: deps.riskService,
  });

  const reportBuilder = createReportBuilderService({
    reporting: deps.reporting,
    reportingService: reporting,
  });

  const reportExport = createReportExportService({
    reporting: deps.reporting,
    reportBuilder,
    storage: deps.storage,
  });

  const reportSchedule = createReportScheduleService({
    reporting: deps.reporting,
    reportExport,
  });

  const biIntegration = createBiIntegrationService({
    reporting: deps.reporting,
    reportingService: reporting,
    storage: deps.storage,
  });

  const benchmark = createBenchmarkService({
    reporting: deps.reporting,
  });

  const trendAnalysis = createTrendAnalysisService({
    reporting: deps.reporting,
  });

  const predictiveAnalytics = createPredictiveAnalyticsService({
    reporting: deps.reporting,
  });

  const kpiSubscription = createKpiSubscriptionService({
    reporting: deps.reporting,
  });

  return {
    reporting,
    kpiEngine,
    dashboard,
    reportBuilder,
    reportExport,
    reportSchedule,
    biIntegration,
    benchmark,
    trendAnalysis,
    predictiveAnalytics,
    kpiSubscription,
  };
}

export type ReportingServiceBundle = ReportingServices;
