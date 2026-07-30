import { auditLogs } from '@workspace/db/schema';
import type { AuditEvent, AuditSink } from '@workspace/platform/audit';
import type { DbExecutor } from '../transaction/transaction-manager.js';

/**
 * Persists audit events to the append-only `audit_logs` table.
 *
 * Accepts either the root database handle or a transaction client so audit rows
 * commit atomically with the mutation they describe.
 */
export class DatabaseAuditSink implements AuditSink {
  constructor(private readonly db: DbExecutor) {}

  async record(event: AuditEvent): Promise<void> {
    await this.db.insert(auditLogs).values({
      entity: event.entity,
      entityId: event.entityId,
      action: event.action,
      eventType: `${event.entity}.${event.action}`,
      severity: 'info',
      actorUserId: event.actorId,
      actorKind: event.actorKind,
      organizationId: event.organizationId,
      sessionId: event.sessionId,
      requestId: event.requestId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      previousValues: event.previousValues,
      newValues: event.newValues,
      metadata: event.metadata,
      occurredAt: event.occurredAt,
    });
  }
}
