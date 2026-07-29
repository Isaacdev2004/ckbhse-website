import {
  AuditRecorder,
  type AuditEvent,
  type AuditSink,
} from '@workspace/platform/audit';
import { FeatureFlagService } from '@workspace/platform/flags';
import {
  InMemoryEmailProvider,
  type EmailProvider,
} from '@workspace/platform/email';
import {
  InMemoryStorageProvider,
  type StorageProvider,
} from '@workspace/platform/storage';
import { NotificationDispatcher } from '@workspace/platform/notifications';
import {
  InMemoryJobQueue,
  JobRegistry,
  type JobQueue,
} from '@workspace/platform/jobs';
import type { Logger, LoggerFactory } from '@workspace/platform/logging';
import { appEnv } from './config';
import { auditLogger, loggerFactory } from './lib/logger';

/**
 * The composition root.
 *
 * Every cross-cutting dependency is constructed here and passed down, rather than
 * imported wherever it is needed. That is what keeps the provider abstractions
 * honest: a route that imports a concrete email client directly has bypassed the
 * abstraction, and this file is the only place such an import should appear.
 *
 * All adapters are currently in-memory. That is the point of this phase — the
 * seams exist and are exercised, so adopting a vendor is a change to this file
 * plus one new adapter class, with no call sites touched.
 */

/**
 * Writes audit events to the audit log channel.
 *
 * A stand-in until the immutable audit table exists. The distinction matters and
 * is worth being explicit about: logs are rotated and are not a compliance
 * record, so this satisfies the *framework* obligation, not the retention one.
 * The sink interface is what makes swapping in the database implementation a
 * one-line change here.
 */
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
        ipAddress: event.ipAddress ?? undefined,
        previousValues: event.previousValues,
        newValues: event.newValues,
      },
      'Audit event',
    );

    return Promise.resolve();
  }
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
}

export interface ContainerOverrides {
  /** Substituted by tests that need to assert on emitted audit events. */
  readonly auditSink?: AuditSink;
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const auditSink = overrides.auditSink ?? new LoggingAuditSink(auditLogger);
  const jobRegistry = new JobRegistry();

  return {
    loggers: loggerFactory,
    flags: new FeatureFlagService(appEnv),
    audit: new AuditRecorder(auditSink),
    email: new InMemoryEmailProvider(),
    storage: new InMemoryStorageProvider(),
    // No channel providers yet; dispatching reports "no provider registered"
    // rather than failing, which is the correct behaviour for an unconfigured
    // channel.
    notifications: new NotificationDispatcher(),
    jobs: new InMemoryJobQueue(jobRegistry),
    jobRegistry,
  };
}

export const container: Container = createContainer();
