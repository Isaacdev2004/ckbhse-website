export type AuditSeverity = 'info' | 'warning' | 'critical';

export type AuditEventType =
  | 'entity.created'
  | 'entity.updated'
  | 'entity.deleted'
  | 'entity.restored'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.permission_granted'
  | 'auth.permission_revoked'
  | 'system.config_changed';

export interface AuditActor {
  readonly userId: string | null;
  readonly actorKind: 'user' | 'service' | 'system' | 'anonymous';
  readonly sessionId: string | null;
}

export interface AuditMetadata {
  readonly requestId: string;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly organizationId: string | null;
}

export interface AuditEntryRecord {
  readonly id: string;
  readonly entity: string;
  readonly entityId: string;
  readonly action: string;
  readonly eventType: AuditEventType;
  readonly severity: AuditSeverity;
  readonly actor: AuditActor;
  readonly metadata: AuditMetadata;
  readonly previousValues: Readonly<Record<string, unknown>> | null;
  readonly newValues: Readonly<Record<string, unknown>> | null;
  readonly occurredAt: Date;
}

export interface AuditContext {
  readonly actor: AuditActor;
  readonly metadata: AuditMetadata;
}
