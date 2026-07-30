import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const idColumn = { id: uuid('id').primaryKey().defaultRandom() };

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

const versionColumn = { version: integer('version').notNull().default(1) };

const auditStampColumns = {
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

export const organizationStatusEnum = pgEnum('organization_status', [
  'prospect',
  'active',
  'dormant',
  'archived',
]);

export const organizationTypeEnum = pgEnum('organization_type', [
  'platform_operator',
  'client',
]);

export const organizations = pgTable(
  'organizations',
  {
    ...idColumn,
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: organizationStatusEnum('status').notNull().default('active'),
    type: organizationTypeEnum('type').notNull().default('client'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    uniqueIndex('organizations_slug_unique').on(table.slug),
    index('organizations_status_idx').on(table.status),
  ],
);

export const userStatusEnum = pgEnum('user_status', [
  'invited',
  'active',
  'suspended',
  'deactivated',
]);

export const users = pgTable(
  'users',
  {
    ...idColumn,
    email: text('email').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    status: userStatusEnum('status').notNull().default('invited'),
    passwordHash: text('password_hash'),
    emailVerifiedAt: timestamp('email_verified_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_status_idx').on(table.status),
  ],
);

export const roles = pgTable(
  'roles',
  {
    ...idColumn,
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isSystem: boolean('is_system').notNull().default(true),
    ...timestampColumns,
    ...auditStampColumns,
  },
  (table) => [uniqueIndex('roles_key_unique').on(table.key)],
);

export const permissions = pgTable(
  'permissions',
  {
    ...idColumn,
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    domain: text('domain').notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex('permissions_key_unique').on(table.key),
    index('permissions_domain_idx').on(table.domain),
  ],
);

export const permissionGroups = pgTable(
  'permission_groups',
  {
    ...idColumn,
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestampColumns,
  },
  (table) => [uniqueIndex('permission_groups_key_unique').on(table.key)],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    ...idColumn,
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex('role_permissions_role_permission_unique').on(
      table.roleId,
      table.permissionId,
    ),
    index('role_permissions_role_idx').on(table.roleId),
  ],
);

export const permissionGroupPermissions = pgTable(
  'permission_group_permissions',
  {
    ...idColumn,
    groupId: uuid('group_id')
      .notNull()
      .references(() => permissionGroups.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex('permission_group_permissions_unique').on(
      table.groupId,
      table.permissionId,
    ),
  ],
);

export const userRoles = pgTable(
  'user_roles',
  {
    ...idColumn,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    scopeType: text('scope_type').notNull().default('organization'),
    scopeId: uuid('scope_id'),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    approvedBy: uuid('approved_by'),
    ...timestampColumns,
    ...auditStampColumns,
  },
  (table) => [
    index('user_roles_user_idx').on(table.userId),
    index('user_roles_org_idx').on(table.organizationId),
    uniqueIndex('user_roles_assignment_unique').on(
      table.userId,
      table.roleId,
      table.organizationId,
      table.scopeType,
      table.scopeId,
    ),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    ...idColumn,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id'),
    tokenHash: text('token_hash').notNull(),
    deviceFingerprint: text('device_fingerprint'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    lastActiveAt: timestamp('last_active_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    rememberMe: boolean('remember_me').notNull().default(false),
    idleExpiresAt: timestamp('idle_expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index('sessions_user_idx').on(table.userId),
    index('sessions_token_hash_idx').on(table.tokenHash),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    ...idColumn,
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
  },
  (table) => [
    index('refresh_tokens_session_idx').on(table.sessionId),
    index('refresh_tokens_token_hash_idx').on(table.tokenHash),
  ],
);

export const contactRequestStatusEnum = pgEnum('contact_request_status', [
  'received',
  'triaged',
  'assigned',
  'converted',
  'closed',
  'spam',
]);

export const contactRequestSourceEnum = pgEnum('contact_request_source', [
  'website',
  'portal',
  'api',
]);

export const contactRequests = pgTable(
  'contact_requests',
  {
    ...idColumn,
    organizationId: uuid('organization_id'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    serviceInterest: text('service_interest').notNull(),
    message: text('message').notNull(),
    status: contactRequestStatusEnum('status').notNull().default('received'),
    source: contactRequestSourceEnum('source').notNull().default('website'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    assignedToUserId: uuid('assigned_to_user_id'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('contact_requests_status_idx').on(table.status),
    index('contact_requests_email_idx').on(table.email),
    index('contact_requests_created_at_idx').on(table.createdAt),
    index('contact_requests_org_idx').on(table.organizationId),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    ...idColumn,
    organizationId: uuid('organization_id'),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action').notNull(),
    eventType: text('event_type').notNull(),
    severity: text('severity').notNull().default('info'),
    actorUserId: uuid('actor_user_id'),
    actorKind: text('actor_kind').notNull(),
    sessionId: uuid('session_id'),
    requestId: text('request_id').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    previousValues: jsonb('previous_values'),
    newValues: jsonb('new_values'),
    metadata: jsonb('metadata'),
    occurredAt: timestamp('occurred_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_entity_idx').on(table.entity, table.entityId),
    index('audit_logs_org_idx').on(table.organizationId),
    index('audit_logs_occurred_at_idx').on(table.occurredAt),
    index('audit_logs_request_id_idx').on(table.requestId),
  ],
);

export const outboxStatusEnum = pgEnum('outbox_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'dead_letter',
]);

export const outbox = pgTable(
  'outbox',
  {
    ...idColumn,
    organizationId: uuid('organization_id'),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    status: outboxStatusEnum('status').notNull().default('pending'),
    idempotencyKey: text('idempotency_key'),
    attemptCount: integer('attempt_count').notNull().default(0),
    lastError: text('last_error'),
    nextAttemptAt: timestamp('next_attempt_at', {
      withTimezone: true,
      mode: 'date',
    }),
    processedAt: timestamp('processed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ...timestampColumns,
  },
  (table) => [
    index('outbox_status_idx').on(table.status),
    index('outbox_aggregate_idx').on(table.aggregateType, table.aggregateId),
    index('outbox_idempotency_key_idx').on(table.idempotencyKey),
  ],
);

export const fileUploadStatusEnum = pgEnum('file_upload_status', [
  'pending',
  'uploaded',
  'verified',
  'failed',
  'deleted',
]);

export const fileUploads = pgTable(
  'file_uploads',
  {
    ...idColumn,
    organizationId: uuid('organization_id').notNull(),
    storageKey: text('storage_key').notNull(),
    originalFilename: text('original_filename').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: text('size_bytes').notNull(),
    checksum: text('checksum'),
    status: fileUploadStatusEnum('status').notNull().default('pending'),
    domain: text('domain').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('file_uploads_org_idx').on(table.organizationId),
    index('file_uploads_storage_key_idx').on(table.storageKey),
    index('file_uploads_entity_idx').on(table.entityType, table.entityId),
  ],
);

export const featureFlags = pgTable(
  'feature_flags',
  {
    ...idColumn,
    key: text('key').notNull(),
    description: text('description'),
    enabled: boolean('enabled').notNull().default(false),
    rules: jsonb('rules'),
    organizationId: uuid('organization_id'),
    ...timestampColumns,
    ...auditStampColumns,
  },
  (table) => [
    index('feature_flags_key_idx').on(table.key),
    index('feature_flags_org_idx').on(table.organizationId),
  ],
);

export const systemSettings = pgTable(
  'system_settings',
  {
    ...idColumn,
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
    description: text('description'),
    isSecret: boolean('is_secret').notNull().default(false),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    uniqueIndex('system_settings_key_unique').on(table.key),
    index('system_settings_key_idx').on(table.key),
  ],
);
