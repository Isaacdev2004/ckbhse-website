import { createDataLayer, type DataLayer } from '@workspace/data';
import {
  DEFAULT_SESSION_COOKIE_NAME,
  SESSION_REMEMBER_ABSOLUTE_MS,
  type SessionCookieManager,
  DatabasePermissionResolver,
} from '@workspace/auth';
import {
  createServices,
  type AuthService,
  type Services,
} from '@workspace/services';
import {
  OutboxWorker,
  createContactRequestCreatedHandler,
  createNotificationDispatchHandler,
  OUTBOX_EVENT_CONTACT_REQUEST_CREATED,
  OUTBOX_EVENT_NOTIFICATION_DISPATCH,
} from '@workspace/workers';
import {
  AuditRecorder,
  type AuditEvent,
  type AuditSink,
} from '@workspace/platform/audit';
import { FeatureFlagService } from '@workspace/platform/flags';
import {
  InMemoryEmailProvider,
  SmtpEmailProvider,
  type EmailProvider,
} from '@workspace/platform/email';
import {
  InMemoryStorageProvider,
  type StorageProvider,
} from '@workspace/platform/storage';
import { NotificationDispatcher } from '@workspace/platform/notifications';
import { createDefaultNotificationProviders } from '@workspace/platform/notifications/providers';
import {
  InMemoryJobQueue,
  JobRegistry,
  type JobQueue,
} from '@workspace/platform/jobs';
import type { Logger, LoggerFactory } from '@workspace/platform/logging';
import {
  appEnv,
  appVersion,
  buildConfig,
  cookieConfig,
  databaseConfig,
  emailConfig,
  isProduction,
  platformConfig,
} from './config';
import { auditLogger, loggerFactory } from './lib/logger';
import { registerReportingJobs } from '@workspace/services/reporting/jobs';
import { registerCmsJobs } from '@workspace/services/cms';
import {
  asOrganizationId,
  asUserId,
} from '@workspace/platform/authorization';

class LoggingAuditSink implements AuditSink {
  constructor(private readonly logger: Logger) {}

  record(event: AuditEvent): Promise<void> {
    this.logger.info(
      {
        requestId: event.requestId,
        entity: event.entity,
        entityId: event.entityId,
        action: event.action,
        actorId: event.actorId ?? undefined,
        actorKind: event.actorKind,
        organizationId: event.organizationId ?? undefined,
        occurredAt: event.occurredAt.toISOString(),
      },
      'Audit event',
    );
    return Promise.resolve();
  }
}

function createEmailProvider(): EmailProvider {
  if (emailConfig.smtpConfigured) {
    return new SmtpEmailProvider({
      host: emailConfig.smtpHost!,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpSecure,
      ...(emailConfig.smtpUser !== undefined
        ? { user: emailConfig.smtpUser }
        : {}),
      ...(emailConfig.smtpPass !== undefined
        ? { pass: emailConfig.smtpPass }
        : {}),
      from: { email: emailConfig.fromEmail, name: emailConfig.fromName },
    });
  }
  return new InMemoryEmailProvider();
}

function createSessionCookieOptions() {
  return {
    name: DEFAULT_SESSION_COOKIE_NAME,
    path: '/',
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAgeSeconds: Math.floor(SESSION_REMEMBER_ABSOLUTE_MS / 1000),
    ...(cookieConfig.options.domain !== undefined
      ? { domain: cookieConfig.options.domain as string }
      : {}),
  };
}

export interface Container {
  readonly loggers: LoggerFactory;
  readonly flags: FeatureFlagService;
  readonly audit: AuditRecorder;
  readonly email: EmailProvider;
  readonly storage: StorageProvider;
  readonly notifications: NotificationDispatcher;
  readonly jobs: JobQueue;
  readonly jobRegistry: JobRegistry;
  readonly dataLayer: DataLayer | null;
  readonly services: Services | null;
  readonly auth: AuthService | null;
  readonly sessionCookies: SessionCookieManager | null;
  readonly outboxWorker: OutboxWorker | null;
}

export interface ContainerOverrides {
  readonly auditSink?: AuditSink;
  readonly dataLayer?: DataLayer | null;
  readonly services?: Services | null;
  readonly email?: EmailProvider;
  readonly outboxWorker?: OutboxWorker | null;
}

function createPlatformLayer(
  overrides: ContainerOverrides,
  email: EmailProvider,
  notifications: NotificationDispatcher,
): {
  dataLayer: DataLayer | null;
  services: Services | null;
  outboxWorker: OutboxWorker | null;
} {
  if (
    overrides.dataLayer !== undefined ||
    overrides.services !== undefined ||
    overrides.outboxWorker !== undefined
  ) {
    return {
      dataLayer: overrides.dataLayer ?? null,
      services: overrides.services ?? null,
      outboxWorker: overrides.outboxWorker ?? null,
    };
  }

  if (!databaseConfig.configured || !platformConfig.configured) {
    return { dataLayer: null, services: null, outboxWorker: null };
  }

  const dataLayer = createDataLayer();
  const services = createServices({
    db: dataLayer.db,
    dataLayer,
    email,
    platformOrganizationId: platformConfig.organizationId!,
    environment: appEnv,
    version: appVersion,
    buildSha: buildConfig.sha,
    buildTime: buildConfig.time,
    supportEmail: emailConfig.supportEmail,
    staffPortalUrl: '/staff/leads',
    sessionCookieOptions: createSessionCookieOptions(),
  });

  const handlers = new Map([
    [
      OUTBOX_EVENT_CONTACT_REQUEST_CREATED,
      createContactRequestCreatedHandler({ leadService: services.lead }),
    ],
    [
      OUTBOX_EVENT_NOTIFICATION_DISPATCH,
      createNotificationDispatchHandler({ notifications }),
    ],
  ]);

  const outboxWorker = new OutboxWorker({
    repository: dataLayer.outboxRepository,
    handlers,
    config: {
      pollingIntervalMs: 5_000,
      batchSize: 25,
      maxAttempts: 5,
      baseBackoffMs: 1_000,
    },
  });

  return { dataLayer, services, outboxWorker };
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const auditSink = overrides.auditSink ?? new LoggingAuditSink(auditLogger);
  const jobRegistry = new JobRegistry();
  const email = overrides.email ?? createEmailProvider();
  const notifications = new NotificationDispatcher(
    createDefaultNotificationProviders({ email }),
  );
  const platform = createPlatformLayer(overrides, email, notifications);

  if (platform.dataLayer && platform.services) {
    const permissionResolver = new DatabasePermissionResolver(platform.dataLayer.db);
    registerReportingJobs(jobRegistry, {
      getReporting: () => platform.services?.reporting ?? null,
      resolvePermissions: async (userId, organizationId) => {
        const resolved = await permissionResolver.resolveForUser(
          asUserId(userId),
          asOrganizationId(organizationId),
        );
        return [...resolved.permissions];
      },
    });
    registerCmsJobs(jobRegistry, {
      getCms: () => platform.services?.cms ?? null,
      resolvePermissions: async (userId, organizationId) => {
        const resolved = await permissionResolver.resolveForUser(
          asUserId(userId),
          asOrganizationId(organizationId),
        );
        return [...resolved.permissions];
      },
    });
  }

  return {
    loggers: loggerFactory,
    flags: new FeatureFlagService(appEnv),
    audit: new AuditRecorder(auditSink),
    email,
    storage: platform.dataLayer?.storage ?? new InMemoryStorageProvider(),
    notifications,
    jobs: new InMemoryJobQueue(jobRegistry),
    jobRegistry,
    dataLayer: platform.dataLayer,
    services: platform.services,
    auth: platform.services?.auth ?? null,
    sessionCookies: platform.services?.sessionCookies ?? null,
    outboxWorker: platform.outboxWorker,
  };
}

export const container: Container = createContainer();

export function startBackgroundWorkers(): void {
  container.outboxWorker?.start();
}

export async function stopBackgroundWorkers(): Promise<void> {
  await container.outboxWorker?.stop();
}
