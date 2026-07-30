import type { SessionCookieManager, SessionCookieOptions } from '@workspace/auth';
import {
  Argon2PasswordHasher,
  DatabasePermissionResolver,
  DatabaseRoleResolver,
  DefaultPasswordPolicyEvaluator,
  DrizzleSessionStore,
  ExpressSessionCookieManager,
} from '@workspace/auth';
import type { DataLayer } from '@workspace/data';
import type { EmailProvider } from '@workspace/platform/email';
import type { Environment } from '@workspace/platform/flags';
import { OutboxWriter } from '@workspace/data/outbox';
import { FeatureFlagRepository } from '@workspace/data/repositories/feature-flag';
import { SystemSettingsRepository } from '@workspace/data/repositories/system-settings';
import { TransactionManager } from '@workspace/data/transaction';

import { AuthService } from './auth/auth.service.js';
import { ContactRequestService } from './contact/contact-request.service.js';
import { DashboardService } from './crm/dashboard.service.js';
import { LeadService } from './crm/lead.service.js';
import { ReminderService } from './crm/reminder.service.js';
import { TimelineService } from './crm/timeline.service.js';
import { FeatureFlagService } from './flags/feature-flag.service.js';
import { PortalService } from './portal/portal.service.js';
import {
  createLearningServices,
  type LearningServices,
} from './learning/index.js';
import {
  createAuditServices,
  type AuditServices,
} from './audit/index.js';
import {
  createComplianceServices,
  type ComplianceServices,
} from './compliance/index.js';
import {
  createCapaServices,
  type CapaServices,
} from './capa/index.js';
import {
  createRiskServices,
  type RiskServices,
} from './risk/index.js';
import { createAdminService, AdminService } from './admin/index.js';
import { createCmsService, CmsService } from './cms/index.js';
import {
  createPublicContentService,
  PublicContentService,
} from './cms/index.js';
import { createCmsMediaService, CmsMediaService } from './cms/index.js';
import {
  createReportingServices,
  type ReportingServices,
} from './reporting/index.js';
import { createFileUploadService, FileUploadService } from './files/index.js';
import { SystemService } from './system/system.service.js';
import { SystemSettingsService } from './system/system-settings.service.js';

/** Data-layer dependencies required to construct application services. */
export interface DataLayerDeps {
  readonly db: import('@workspace/db').Database;
  readonly platformOrganizationId: string;
  readonly environment: Environment;
  readonly version: string;
  readonly buildSha?: string | null;
  readonly buildTime?: Date | null;
  readonly serviceName?: string;
}

export interface ServiceLayerDeps extends DataLayerDeps {
  readonly dataLayer: DataLayer;
  readonly email: EmailProvider;
  readonly supportEmail?: string;
  readonly staffPortalUrl?: string;
  readonly sessionCookieOptions: SessionCookieOptions;
}

/** Application services wired from the data layer. */
export interface Services {
  readonly auth: AuthService;
  readonly sessionCookies: SessionCookieManager;
  readonly contactRequest: ContactRequestService;
  readonly lead: LeadService;
  readonly timeline: TimelineService;
  readonly dashboard: DashboardService;
  readonly reminders: ReminderService;
  readonly system: SystemService;
  readonly systemSettings: SystemSettingsService;
  readonly featureFlags: FeatureFlagService;
  readonly portal: PortalService;
  readonly learning: LearningServices;
  readonly audit: AuditServices;
  readonly compliance: ComplianceServices;
  readonly capa: CapaServices;
  readonly risk: RiskServices;
  readonly admin: AdminService;
  readonly cms: CmsService;
  readonly publicContent: PublicContentService;
  readonly cmsMedia: CmsMediaService;
  readonly reporting: ReportingServices;
  readonly files: FileUploadService;
}

export function createServices(deps: ServiceLayerDeps): Services {
  const transactionManager = new TransactionManager(deps.db);
  const outboxWriter = new OutboxWriter();
  const systemSettingsRepository = new SystemSettingsRepository(deps.db);
  const featureFlagRepository = new FeatureFlagRepository(deps.db);
  const sessionStore = new DrizzleSessionStore(deps.db);
  const sessionCookies = new ExpressSessionCookieManager(
    deps.sessionCookieOptions,
  );
  const dashboard = new DashboardService(deps.dataLayer);
  const learning = createLearningServices({
    repos: {
      enrollment: deps.dataLayer.enrollmentRepository,
      learning: deps.dataLayer.learningRepository,
      assessment: deps.dataLayer.assessmentRepository,
      certificate: deps.dataLayer.certificateRepository,
      session: deps.dataLayer.sessionRepository,
      trainer: deps.dataLayer.trainerRepository,
      transcript: deps.dataLayer.transcriptRepository,
      cpd: deps.dataLayer.cpdRepository,
    },
    store: deps.dataLayer.learningStore,
    cpd: deps.dataLayer.cpdRepository,
  });
  const compliance = createComplianceServices({
    repos: {
      inspection: deps.dataLayer.inspectionRepository,
      compliance: deps.dataLayer.complianceRepository,
      legal: deps.dataLayer.legalRegisterRepository,
      regulatory: deps.dataLayer.regulatoryRepository,
      control: deps.dataLayer.controlRepository,
      calendar: deps.dataLayer.complianceCalendarRepository,
      audit: deps.dataLayer.auditRepository,
      capa: deps.dataLayer.capaRepository,
    },
    analytics: deps.dataLayer.complianceAnalyticsRepository,
  });
  const riskServices = createRiskServices({
    risk: deps.dataLayer.riskRepository,
  });

  return {
    auth: new AuthService({
      db: deps.db,
      sessionStore,
      sessionCookies,
      passwordHasher: new Argon2PasswordHasher(),
      passwordPolicy: new DefaultPasswordPolicyEvaluator(),
      permissionResolver: new DatabasePermissionResolver(deps.db),
      roleResolver: new DatabaseRoleResolver(deps.db),
      defaultOrganizationId: deps.platformOrganizationId,
    }),
    sessionCookies,
    contactRequest: new ContactRequestService({
      transactionManager,
      outboxWriter,
      platformOrganizationId: deps.platformOrganizationId,
    }),
    lead: new LeadService({
      dataLayer: deps.dataLayer,
      platformOrganizationId: deps.platformOrganizationId,
      email: deps.email,
      ...(deps.supportEmail !== undefined
        ? { supportEmail: deps.supportEmail }
        : {}),
      ...(deps.staffPortalUrl !== undefined
        ? { staffPortalUrl: deps.staffPortalUrl }
        : {}),
    }),
    timeline: new TimelineService(deps.dataLayer),
    dashboard,
    reminders: new ReminderService(deps.dataLayer),
    system: new SystemService({
      version: deps.version,
      environment: deps.environment,
      ...(deps.buildSha !== undefined ? { buildSha: deps.buildSha } : {}),
      ...(deps.buildTime !== undefined ? { buildTime: deps.buildTime } : {}),
      ...(deps.serviceName !== undefined ? { serviceName: deps.serviceName } : {}),
    }),
    systemSettings: new SystemSettingsService(systemSettingsRepository),
    featureFlags: new FeatureFlagService(
      deps.environment,
      featureFlagRepository,
    ),
    portal: new PortalService(deps.dataLayer.portalRepository),
    learning,
    audit: createAuditServices({
      repos: {
        audit: deps.dataLayer.auditRepository,
        template: deps.dataLayer.auditTemplateRepository,
        finding: deps.dataLayer.findingRepository,
        checklist: deps.dataLayer.checklistRepository,
        evidence: deps.dataLayer.evidenceRepository,
        assignment: deps.dataLayer.auditAssignmentRepository,
      },
      store: deps.dataLayer.auditStore,
      auditRepo: deps.dataLayer.auditRepository,
      templateRepo: deps.dataLayer.auditTemplateRepository,
    }),
    compliance,
    capa: createCapaServices({
      capa: deps.dataLayer.capaRepository,
      store: deps.dataLayer.capaStore,
    }),
    risk: riskServices,
    admin: createAdminService({
      admin: deps.dataLayer.adminRepository,
      system: new SystemService({
        version: deps.version,
        environment: deps.environment,
        ...(deps.buildSha !== undefined ? { buildSha: deps.buildSha } : {}),
        ...(deps.buildTime !== undefined ? { buildTime: deps.buildTime } : {}),
        ...(deps.serviceName !== undefined ? { serviceName: deps.serviceName } : {}),
      }),
    }),
    cms: createCmsService({
      cms: deps.dataLayer.cmsRepository,
    }),
    publicContent: createPublicContentService({
      content: deps.dataLayer.publicContentRepository,
    }),
    cmsMedia: createCmsMediaService({
      media: deps.dataLayer.cmsMediaRepository,
      storage: deps.dataLayer.storage,
    }),
    reporting: createReportingServices({
      reporting: deps.dataLayer.reportingRepository,
      complianceAnalytics: compliance.analytics,
      audit: deps.dataLayer.auditRepository,
      crmDashboard: dashboard,
      learningAnalytics: learning.analytics,
      riskService: riskServices.risk,
      storage: deps.dataLayer.storage,
    }),
    files: createFileUploadService({
      uploads: deps.dataLayer.fileUploadRepository,
      storage: deps.dataLayer.storage,
    }),
  };
}

export { AuthService } from './auth/auth.service.js';
export { ContactRequestService } from './contact/contact-request.service.js';
export { LeadService } from './crm/lead.service.js';
export { TimelineService } from './crm/timeline.service.js';
export { DashboardService } from './crm/dashboard.service.js';
export { ReminderService } from './crm/reminder.service.js';
export { SystemService } from './system/system.service.js';
export { SystemSettingsService } from './system/system-settings.service.js';
export { FeatureFlagService } from './flags/feature-flag.service.js';
export { PortalService } from './portal/portal.service.js';
export {
  createLearningServices,
  LearningService,
  EnrollmentService,
  AssessmentService,
  CertificateService,
  TrainerService,
  TranscriptService,
  LearningAnalyticsService,
  CPDService,
  CourseRecommendationService,
  LearningNotificationService,
  type LearningServices,
} from './learning/index.js';
export {
  createAuditServices,
  AuditService,
  AuditCalendarService,
  AuditReportService,
  type AuditServices,
  type AuditRepositories,
  type AuditDashboardData,
} from './audit/index.js';
export {
  createComplianceServices,
  InspectionService,
  ComplianceService,
  ComplianceScoreService,
  LegalRegisterService,
  RegulatoryService,
  type ComplianceWorkspaceData,
  type ComplianceDashboardData,
  ControlRegisterService,
  ComplianceAnalyticsService,
  type ComplianceServices,
  type ComplianceAnalyticsExecutiveData,
} from './compliance/index.js';
export {
  createCapaServices,
  CapaService,
  type CapaServices,
  type CapaDashboardData,
} from './capa/index.js';
export {
  createRiskServices,
  RiskService,
  type RiskServices,
  type RiskDashboardData,
} from './risk/index.js';
export {
  calculateRiskScore,
  buildRiskScore,
  resolveRiskRating,
  aggregateHeatMap,
  DEFAULT_RATING_THRESHOLDS,
} from './risk/matrix.js';
export {
  createReportingServices,
  ReportingService,
  KpiEngineService,
  REPORTING_KPI_REFRESH_JOB,
  type ReportingServices,
} from './reporting/index.js';
