import { getDb, type Database } from '@workspace/db';
import { AuditRecorder } from '@workspace/platform/audit';
import path from 'node:path';
import { DatabaseAuditSink } from './audit/database-audit-sink.js';
import {
  CONTACT_REQUEST_DEFINITION,
  type ContactRequestEntity,
} from './mappers/contact-request.mapper.js';
import {
  LEAD_DEFINITION,
  type LeadEntity,
} from './mappers/lead.mapper.js';
import { OutboxWriter } from './outbox/outbox-writer.js';
import {
  ContactRequestRepository,
  auditHooks,
} from './repositories/contact-request.repository.js';
import { FeatureFlagRepository } from './repositories/feature-flag.repository.js';
import { LeadActivityRepository } from './repositories/lead-activity.repository.js';
import { LeadAssignmentRepository } from './repositories/lead-assignment.repository.js';
import { LeadNoteRepository } from './repositories/lead-note.repository.js';
import {
  LeadRepository,
  auditHooks as leadAuditHooks,
} from './repositories/lead.repository.js';
import { LeadReminderRepository } from './repositories/lead-reminder.repository.js';
import { LeadStatusHistoryRepository } from './repositories/lead-status-history.repository.js';
import { LeadTagRepository } from './repositories/lead-tag.repository.js';
import { OutboxRepository } from './repositories/outbox.repository.js';
import { PortalRepository } from './repositories/portal.repository.js';
import { EnrollmentRepository } from './repositories/enrollment.repository.js';
import { LearningRepository } from './repositories/learning.repository.js';
import { AssessmentRepository } from './repositories/assessment.repository.js';
import { CertificateRepository } from './repositories/certificate.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { TrainerRepository } from './repositories/trainer.repository.js';
import { TranscriptRepository } from './repositories/transcript.repository.js';
import { CPDRepository } from './repositories/cpd.repository.js';
import { SystemSettingsRepository } from './repositories/system-settings.repository.js';
import { PERMISSION_SEED, ROLE_PERMISSION_SEED, ROLE_SEED } from './seed/permissions-seed.js';
import { createStorageProvider } from './storage/create-storage-provider.js';
import type { StorageProvider } from '@workspace/platform/storage';
import { DrizzleContactRequestStore } from './stores/drizzle-contact-request.store.js';
import { DrizzleLeadStore } from './stores/drizzle-lead.store.js';
import { DrizzlePortalStore } from './stores/drizzle-portal.store.js';
import { DrizzleLearningStore } from './stores/drizzle-learning.store.js';
import { DrizzleAuditStore } from './stores/drizzle-audit.store.js';
import { DrizzleComplianceStore } from './stores/drizzle-compliance.store.js';
import { AuditRepository } from './repositories/audit.repository.js';
import {
  AuditAssignmentRepository,
  AuditTemplateRepository,
  ChecklistRepository,
  EvidenceRepository,
  FindingRepository,
} from './repositories/audit-compliance.repository.js';
import {
  ComplianceAnalyticsRepository,
  ComplianceCalendarRepository,
  ComplianceRepository,
  ControlRepository,
  InspectionRepository,
  LegalRegisterRepository,
  RegulatoryRepository,
} from './repositories/compliance.repository.js';
import { CapaRepository } from './repositories/capa.repository.js';
import { DrizzleCapaStore } from './stores/drizzle-capa.store.js';
import { RiskRepository } from './repositories/risk.repository.js';
import { DrizzleRiskStore } from './stores/drizzle-risk.store.js';
import { DrizzleAdminStore } from './stores/drizzle-admin.store.js';
import { AdminRepository } from './repositories/admin.repository.js';
import { DrizzleCmsStore } from './stores/drizzle-cms.store.js';
import { DrizzleFileUploadStore } from './stores/drizzle-file-upload.store.js';
import { DrizzleCmsMediaStore } from './stores/drizzle-cms-media.store.js';
import { CmsRepository } from './repositories/cms.repository.js';
import { FileUploadRepository } from './repositories/file-upload.repository.js';
import { PublicContentRepository } from './repositories/public-content.repository.js';
import { CmsMediaRepository } from './repositories/cms-media.repository.js';
import { DrizzleReportingStore } from './stores/drizzle-reporting.store.js';
import { ReportingRepository } from './repositories/reporting.repository.js';
import { runInTransaction, type TransactionClient } from './transaction/transaction-manager.js';

export * from './transaction/transaction-manager.js';
export * from './audit/database-audit-sink.js';
export * from './outbox/outbox-writer.js';
export * from './mappers/contact-request.mapper.js';
export * from './mappers/lead.mapper.js';
export * from './stores/drizzle-contact-request.store.js';
export * from './stores/drizzle-lead.store.js';
export * from './repositories/contact-request.repository.js';
export * from './repositories/lead.repository.js';
export * from './repositories/lead-activity.repository.js';
export * from './repositories/lead-note.repository.js';
export * from './repositories/lead-assignment.repository.js';
export * from './repositories/lead-reminder.repository.js';
export * from './repositories/lead-tag.repository.js';
export * from './repositories/lead-status-history.repository.js';
export * from './repositories/outbox.repository.js';
export * from './repositories/system-settings.repository.js';
export * from './repositories/feature-flag.repository.js';
export * from './repositories/portal.repository.js';
export * from './repositories/enrollment.repository.js';
export * from './repositories/learning.repository.js';
export * from './repositories/assessment.repository.js';
export * from './repositories/certificate.repository.js';
export * from './repositories/session.repository.js';
export * from './repositories/trainer.repository.js';
export * from './repositories/transcript.repository.js';
export * from './repositories/cpd.repository.js';
export * from './stores/drizzle-portal.store.js';
export * from './stores/drizzle-learning.store.js';
export * from './stores/drizzle-audit.store.js';
export * from './stores/drizzle-compliance.store.js';
export * from './repositories/audit.repository.js';
export * from './repositories/audit-compliance.repository.js';
export * from './repositories/compliance.repository.js';
export * from './repositories/capa.repository.js';
export * from './stores/drizzle-capa.store.js';
export * from './repositories/risk.repository.js';
export * from './stores/drizzle-risk.store.js';
export * from './stores/drizzle-admin.store.js';
export * from './repositories/admin.repository.js';
export * from './stores/drizzle-cms.store.js';
export * from './stores/drizzle-cms-media.store.js';
export * from './repositories/cms.repository.js';
export * from './repositories/public-content.repository.js';
export * from './repositories/cms-media.repository.js';
export * from './stores/drizzle-reporting.store.js';
export * from './repositories/reporting.repository.js';
export * from './storage/local-storage-provider.js';
export * from './seed/permissions-seed.js';
export * from './seed/role-inheritance.js';

export interface CreateDataLayerOptions {
  readonly db?: Database;
  readonly storageRoot?: string;
  readonly storageBaseUrl?: string;
}

export interface DataLayer {
  readonly db: Database;
  readonly auditSink: DatabaseAuditSink;
  readonly auditRecorder: AuditRecorder;
  readonly contactRequestStore: DrizzleContactRequestStore;
  readonly contactRequestRepository: ContactRequestRepository;
  readonly leadStore: DrizzleLeadStore;
  readonly leadRepository: LeadRepository;
  readonly leadActivityRepository: LeadActivityRepository;
  readonly leadNoteRepository: LeadNoteRepository;
  readonly leadAssignmentRepository: LeadAssignmentRepository;
  readonly leadReminderRepository: LeadReminderRepository;
  readonly leadTagRepository: LeadTagRepository;
  readonly leadStatusHistoryRepository: LeadStatusHistoryRepository;
  readonly outboxRepository: OutboxRepository;
  readonly outboxWriter: OutboxWriter;
  readonly systemSettingsRepository: SystemSettingsRepository;
  readonly featureFlagRepository: FeatureFlagRepository;
  readonly portalStore: DrizzlePortalStore;
  readonly portalRepository: PortalRepository;
  readonly learningStore: DrizzleLearningStore;
  readonly enrollmentRepository: EnrollmentRepository;
  readonly learningRepository: LearningRepository;
  readonly assessmentRepository: AssessmentRepository;
  readonly certificateRepository: CertificateRepository;
  readonly sessionRepository: SessionRepository;
  readonly trainerRepository: TrainerRepository;
  readonly transcriptRepository: TranscriptRepository;
  readonly cpdRepository: CPDRepository;
  readonly auditStore: DrizzleAuditStore;
  readonly auditRepository: AuditRepository;
  readonly auditTemplateRepository: AuditTemplateRepository;
  readonly findingRepository: FindingRepository;
  readonly checklistRepository: ChecklistRepository;
  readonly evidenceRepository: EvidenceRepository;
  readonly auditAssignmentRepository: AuditAssignmentRepository;
  readonly complianceStore: DrizzleComplianceStore;
  readonly inspectionRepository: InspectionRepository;
  readonly complianceRepository: ComplianceRepository;
  readonly legalRegisterRepository: LegalRegisterRepository;
  readonly regulatoryRepository: RegulatoryRepository;
  readonly controlRepository: ControlRepository;
  readonly complianceCalendarRepository: ComplianceCalendarRepository;
  readonly complianceAnalyticsRepository: ComplianceAnalyticsRepository;
  readonly capaStore: DrizzleCapaStore;
  readonly capaRepository: CapaRepository;
  readonly riskStore: DrizzleRiskStore;
  readonly riskRepository: RiskRepository;
  readonly adminStore: DrizzleAdminStore;
  readonly adminRepository: AdminRepository;
  readonly cmsStore: DrizzleCmsStore;
  readonly cmsRepository: CmsRepository;
  readonly cmsMediaStore: DrizzleCmsMediaStore;
  readonly publicContentRepository: PublicContentRepository;
  readonly cmsMediaRepository: CmsMediaRepository;
  readonly reportingStore: DrizzleReportingStore;
  readonly reportingRepository: ReportingRepository;
  readonly fileUploadStore: DrizzleFileUploadStore;
  readonly fileUploadRepository: FileUploadRepository;
  readonly storage: StorageProvider;
  runInTransaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
}

/**
 * Wire the data layer with production adapters.
 *
 * Pass explicit handles in tests to avoid requiring `DATABASE_URL`.
 */
export function createDataLayer(
  options: CreateDataLayerOptions = {},
): DataLayer {
  const db = options.db ?? getDb();
  const auditSink = new DatabaseAuditSink(db);
  const auditRecorder = new AuditRecorder(auditSink);
  const contactRequestStore = new DrizzleContactRequestStore(db);

  const contactRequestRepository = new ContactRequestRepository({
    store: contactRequestStore,
    hooks: auditHooks(auditRecorder, CONTACT_REQUEST_DEFINITION),
  });

  const leadStore = new DrizzleLeadStore(db);

  const leadRepository = new LeadRepository({
    store: leadStore,
    hooks: leadAuditHooks(auditRecorder, LEAD_DEFINITION),
  });

  const portalStore = new DrizzlePortalStore(db);
  const portalRepository = new PortalRepository(portalStore);

  const learningStore = new DrizzleLearningStore(db);
  const enrollmentRepository = new EnrollmentRepository(learningStore);
  const learningRepository = new LearningRepository(learningStore);
  const assessmentRepository = new AssessmentRepository(learningStore);
  const certificateRepository = new CertificateRepository(learningStore);
  const sessionRepository = new SessionRepository(learningStore);
  const trainerRepository = new TrainerRepository(learningStore);
  const transcriptRepository = new TranscriptRepository(learningStore);
  const cpdRepository = new CPDRepository(learningStore);

  const auditStore = new DrizzleAuditStore(db);
  const auditRepository = new AuditRepository(auditStore);
  const auditTemplateRepository = new AuditTemplateRepository(auditStore);
  const findingRepository = new FindingRepository(auditStore);
  const checklistRepository = new ChecklistRepository(auditStore);
  const evidenceRepository = new EvidenceRepository(auditStore);
  const auditAssignmentRepository = new AuditAssignmentRepository(auditStore);

  const complianceStore = new DrizzleComplianceStore(db);
  const inspectionRepository = new InspectionRepository(complianceStore);
  const complianceRepository = new ComplianceRepository(complianceStore);
  const legalRegisterRepository = new LegalRegisterRepository(complianceStore);
  const regulatoryRepository = new RegulatoryRepository(complianceStore);
  const controlRepository = new ControlRepository(complianceStore);
  const complianceCalendarRepository = new ComplianceCalendarRepository(complianceStore);
  const complianceAnalyticsRepository = new ComplianceAnalyticsRepository(complianceStore);

  const capaStore = new DrizzleCapaStore(db);
  const capaRepository = new CapaRepository(capaStore);

  const riskStore = new DrizzleRiskStore(db);
  const riskRepository = new RiskRepository(riskStore);

  const adminStore = new DrizzleAdminStore(db);
  const featureFlagRepository = new FeatureFlagRepository(db);
  const adminRepository = new AdminRepository(adminStore, featureFlagRepository);
  const cmsStore = new DrizzleCmsStore(db);
  const cmsRepository = new CmsRepository(cmsStore);
  const cmsMediaStore = new DrizzleCmsMediaStore(db);
  const publicContentRepository = new PublicContentRepository(cmsStore);
  const cmsMediaRepository = new CmsMediaRepository(cmsMediaStore, cmsStore);
  const reportingStore = new DrizzleReportingStore(db);
  const reportingRepository = new ReportingRepository(reportingStore);
  const fileUploadStore = new DrizzleFileUploadStore(db);
  const fileUploadRepository = new FileUploadRepository(fileUploadStore);

  const storageRoot =
    options.storageRoot ?? path.join(process.cwd(), '.storage');
  const storage = createStorageProvider(process.env, {
    storageRoot,
    ...(options.storageBaseUrl !== undefined
      ? { storageBaseUrl: options.storageBaseUrl }
      : {}),
  });

  return {
    db,
    auditSink,
    auditRecorder,
    contactRequestStore,
    contactRequestRepository,
    leadStore,
    leadRepository,
    leadActivityRepository: new LeadActivityRepository(db),
    leadNoteRepository: new LeadNoteRepository({ db }),
    leadAssignmentRepository: new LeadAssignmentRepository(db),
    leadReminderRepository: new LeadReminderRepository({ db }),
    leadTagRepository: new LeadTagRepository(db),
    leadStatusHistoryRepository: new LeadStatusHistoryRepository(db),
    outboxRepository: new OutboxRepository(db),
    outboxWriter: new OutboxWriter(),
    systemSettingsRepository: new SystemSettingsRepository(db),
    featureFlagRepository,
    portalStore,
    portalRepository,
    learningStore,
    enrollmentRepository,
    learningRepository,
    assessmentRepository,
    certificateRepository,
    sessionRepository,
    trainerRepository,
    transcriptRepository,
    cpdRepository,
    auditStore,
    auditRepository,
    auditTemplateRepository,
    findingRepository,
    checklistRepository,
    evidenceRepository,
    auditAssignmentRepository,
    complianceStore,
    inspectionRepository,
    complianceRepository,
    legalRegisterRepository,
    regulatoryRepository,
    controlRepository,
    complianceCalendarRepository,
    complianceAnalyticsRepository,
    capaStore,
    capaRepository,
    riskStore,
    riskRepository,
    adminStore,
    adminRepository,
    cmsStore,
    cmsRepository,
    cmsMediaStore,
    publicContentRepository,
    cmsMediaRepository,
    reportingStore,
    reportingRepository,
    fileUploadStore,
    fileUploadRepository,
    storage,
    runInTransaction: <T>(fn: (tx: TransactionClient) => Promise<T>) =>
      runInTransaction(fn, db),
  };
}

export type { ContactRequestEntity, LeadEntity };

export { PERMISSION_SEED, ROLE_SEED, ROLE_PERMISSION_SEED };
