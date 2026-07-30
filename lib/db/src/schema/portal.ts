import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { organizations, users } from './foundation.js';

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

export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'active',
  'archived',
  'expired',
]);

export const actionStatusEnum = pgEnum('action_status', [
  'open',
  'in_progress',
  'overdue',
  'completed',
]);

export const actionPriorityEnum = pgEnum('action_priority', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const incidentStatusEnum = pgEnum('incident_status', [
  'reported',
  'investigating',
  'corrective_action',
  'closed',
]);

export const auditStatusEnum = pgEnum('audit_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]);

export const supportTicketStatusEnum = pgEnum('support_ticket_status', [
  'open',
  'in_progress',
  'awaiting_client',
  'resolved',
  'closed',
]);

export const supportTicketPriorityEnum = pgEnum('support_ticket_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const certificateTypeEnum = pgEnum('certificate_type', [
  'iso',
  'training',
  'compliance',
  'inspection',
  'audit',
]);

export const organizationMemberStatusEnum = pgEnum('organization_member_status', [
  'invited',
  'active',
  'suspended',
  'deactivated',
]);

export const activityKindEnum = pgEnum('activity_kind', [
  'auth',
  'project',
  'document',
  'training',
  'audit',
  'incident',
  'message',
  'support',
  'profile',
  'system',
]);

export const organizationProfiles = pgTable(
  'organization_profiles',
  {
    organizationId: uuid('organization_id')
      .primaryKey()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    registrationNumber: text('registration_number'),
    industry: text('industry'),
    primaryContactName: text('primary_contact_name'),
    primaryContactEmail: text('primary_contact_email'),
    secondaryContacts: jsonb('secondary_contacts').notNull().default([]),
    address: jsonb('address'),
    locations: jsonb('locations').notNull().default([]),
    accountTier: text('account_tier'),
    subscription: text('subscription'),
    renewalDate: timestamp('renewal_date', {
      withTimezone: true,
      mode: 'date',
    }),
    assignedConsultantId: uuid('assigned_consultant_id'),
    primaryAuditorId: uuid('primary_auditor_id'),
    trainingManagerId: uuid('training_manager_id'),
    complianceManagerId: uuid('compliance_manager_id'),
    logoUrl: text('logo_url'),
    accreditations: jsonb('accreditations').notNull().default([]),
    riskProfile: text('risk_profile'),
    healthScore: integer('health_score'),
    complianceScore: integer('compliance_score'),
    ...timestampColumns,
  },
  (table) => [index('organization_profiles_industry_idx').on(table.industry)],
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    department: text('department'),
    site: text('site'),
    status: organizationMemberStatusEnum('status').notNull().default('active'),
    invitedAt: timestamp('invited_at', { withTimezone: true, mode: 'date' }),
    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('organization_members_org_idx').on(table.organizationId),
    index('organization_members_user_idx').on(table.userId),
  ],
);

export const organizationSettings = pgTable('organization_settings', {
  organizationId: uuid('organization_id')
    .primaryKey()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  preferences: jsonb('preferences').notNull().default({}),
  notificationPreferences: jsonb('notification_preferences')
    .notNull()
    .default({}),
  branding: jsonb('branding').notNull().default({}),
  timezone: text('timezone').notNull().default('Europe/London'),
  language: text('language').notNull().default('en-GB'),
  documentDefaults: jsonb('document_defaults').notNull().default({}),
  securitySettings: jsonb('security_settings').notNull().default({}),
  ...timestampColumns,
});

export const organizationProjects = pgTable(
  'organization_projects',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('planning'),
    progressPercent: integer('progress_percent').notNull().default(0),
    startDate: timestamp('start_date', { withTimezone: true, mode: 'date' }),
    endDate: timestamp('end_date', { withTimezone: true, mode: 'date' }),
    consultantId: uuid('consultant_id'),
    serviceType: text('service_type'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('organization_projects_org_idx').on(table.organizationId),
    index('organization_projects_status_idx').on(table.status),
  ],
);

export const projectTasks = pgTable(
  'project_tasks',
  {
    ...idColumn,
    projectId: uuid('project_id')
      .notNull()
      .references(() => organizationProjects.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: actionStatusEnum('status').notNull().default('open'),
    assigneeUserId: uuid('assignee_user_id'),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ...timestampColumns,
  },
  (table) => [index('project_tasks_project_idx').on(table.projectId)],
);

export const projectComments = pgTable(
  'project_comments',
  {
    ...idColumn,
    projectId: uuid('project_id')
      .notNull()
      .references(() => organizationProjects.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    authorUserId: uuid('author_user_id').notNull(),
    body: text('body').notNull(),
    ...timestampColumns,
  },
  (table) => [index('project_comments_project_idx').on(table.projectId)],
);

export const organizationDocuments = pgTable(
  'organization_documents',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    folderId: uuid('folder_id'),
    name: text('name').notNull(),
    category: text('category'),
    tags: jsonb('tags').notNull().default([]),
    storageKey: text('storage_key').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    ownerUserId: uuid('owner_user_id'),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    status: documentStatusEnum('status').notNull().default('active'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('organization_documents_org_idx').on(table.organizationId),
    index('organization_documents_category_idx').on(table.category),
  ],
);

export const organizationDocumentVersions = pgTable(
  'organization_document_versions',
  {
    ...idColumn,
    documentId: uuid('document_id')
      .notNull()
      .references(() => organizationDocuments.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    storageKey: text('storage_key').notNull(),
    uploadedByUserId: uuid('uploaded_by_user_id'),
    ...timestampColumns,
  },
  (table) => [
    index('organization_document_versions_doc_idx').on(table.documentId),
  ],
);

export const organizationCertificates = pgTable(
  'organization_certificates',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    certificateType: certificateTypeEnum('certificate_type').notNull(),
    issuedAt: timestamp('issued_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    verificationStatus: text('verification_status')
      .notNull()
      .default('valid'),
    storageKey: text('storage_key'),
    ...timestampColumns,
  },
  (table) => [
    index('organization_certificates_org_idx').on(table.organizationId),
    index('organization_certificates_expires_idx').on(table.expiresAt),
  ],
);

export const organizationActions = pgTable(
  'organization_actions',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: actionStatusEnum('status').notNull().default('open'),
    priority: actionPriorityEnum('priority').notNull().default('medium'),
    ownerUserId: uuid('owner_user_id'),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('organization_actions_org_idx').on(table.organizationId),
    index('organization_actions_status_idx').on(table.status),
  ],
);

export const organizationIncidents = pgTable(
  'organization_incidents',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    severity: incidentSeverityEnum('severity').notNull().default('medium'),
    status: incidentStatusEnum('status').notNull().default('reported'),
    ownerUserId: uuid('owner_user_id'),
    reportedAt: timestamp('reported_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('organization_incidents_org_idx').on(table.organizationId),
    index('organization_incidents_status_idx').on(table.status),
  ],
);

export const organizationAudits = pgTable(
  'organization_audits',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    auditorId: uuid('auditor_id'),
    scheduledAt: timestamp('scheduled_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    status: auditStatusEnum('status').notNull().default('scheduled'),
    score: integer('score'),
    reportStorageKey: text('report_storage_key'),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('organization_audits_org_idx').on(table.organizationId),
    index('organization_audits_scheduled_idx').on(table.scheduledAt),
  ],
);

export const supportTickets = pgTable(
  'support_tickets',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    category: text('category'),
    priority: supportTicketPriorityEnum('priority').notNull().default('medium'),
    status: supportTicketStatusEnum('status').notNull().default('open'),
    requesterUserId: uuid('requester_user_id').notNull(),
    assigneeUserId: uuid('assignee_user_id'),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('support_tickets_org_idx').on(table.organizationId),
    index('support_tickets_status_idx').on(table.status),
  ],
);

export const supportTicketMessages = pgTable(
  'support_ticket_messages',
  {
    ...idColumn,
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    authorUserId: uuid('author_user_id').notNull(),
    body: text('body').notNull(),
    isStaff: boolean('is_staff').notNull().default(false),
    ...timestampColumns,
  },
  (table) => [index('support_ticket_messages_ticket_idx').on(table.ticketId)],
);

export const organizationMessageThreads = pgTable(
  'organization_message_threads',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    lastMessageAt: timestamp('last_message_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index('organization_message_threads_org_idx').on(table.organizationId),
  ],
);

export const organizationMessages = pgTable(
  'organization_messages',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    threadId: uuid('thread_id')
      .notNull()
      .references(() => organizationMessageThreads.id, { onDelete: 'cascade' }),
    senderUserId: uuid('sender_user_id').notNull(),
    body: text('body').notNull(),
    isInternal: boolean('is_internal').notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    index('organization_messages_thread_idx').on(table.threadId),
    index('organization_messages_org_idx').on(table.organizationId),
  ],
);

export const organizationActivities = pgTable(
  'organization_activities',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    kind: activityKindEnum('kind').notNull(),
    summary: text('summary').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    actorUserId: uuid('actor_user_id'),
    occurredAt: timestamp('occurred_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    metadata: jsonb('metadata').notNull().default({}),
    ...timestampColumns,
  },
  (table) => [
    index('organization_activities_org_idx').on(table.organizationId),
    index('organization_activities_occurred_idx').on(table.occurredAt),
  ],
);

export const complianceTasks = pgTable(
  'compliance_tasks',
  {
    ...idColumn,
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
    status: actionStatusEnum('status').notNull().default('open'),
    registerType: text('register_type'),
    ...timestampColumns,
  },
  (table) => [index('compliance_tasks_org_idx').on(table.organizationId)],
);
