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

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'acknowledged',
  'qualified',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
  'archived',
]);

export const leadPriorityEnum = pgEnum('lead_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'website',
  'referral',
  'phone',
  'email',
  'event',
  'partner',
  'other',
]);

export const leadActivityTypeEnum = pgEnum('lead_activity_type', [
  'email_sent',
  'status_changed',
  'assignment',
  'phone_call',
  'meeting',
  'document_uploaded',
  'reminder',
  'note_added',
  'lead_created',
]);

export const leads = pgTable(
  'leads',
  {
    ...idColumn,
    organizationId: uuid('organization_id').notNull(),
    contactRequestId: uuid('contact_request_id'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    serviceInterest: text('service_interest').notNull(),
    industry: text('industry'),
    trainingInterest: text('training_interest'),
    message: text('message'),
    status: leadStatusEnum('status').notNull().default('new'),
    priority: leadPriorityEnum('priority').notNull().default('normal'),
    source: leadSourceEnum('source').notNull().default('website'),
    assignedToUserId: uuid('assigned_to_user_id'),
    score: integer('score'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('leads_org_idx').on(table.organizationId),
    index('leads_status_idx').on(table.status),
    index('leads_priority_idx').on(table.priority),
    index('leads_email_idx').on(table.email),
    index('leads_assigned_idx').on(table.assignedToUserId),
    index('leads_created_at_idx').on(table.createdAt),
    uniqueIndex('leads_contact_request_unique').on(table.contactRequestId),
  ],
);

export const leadSources = pgTable(
  'lead_sources',
  {
    ...idColumn,
    organizationId: uuid('organization_id').notNull(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    uniqueIndex('lead_sources_org_key_unique').on(
      table.organizationId,
      table.key,
    ),
    index('lead_sources_org_idx').on(table.organizationId),
  ],
);

export const leadActivities = pgTable(
  'lead_activities',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    activityType: leadActivityTypeEnum('activity_type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    actorUserId: uuid('actor_user_id'),
    metadata: jsonb('metadata'),
    ...timestampColumns,
  },
  (table) => [
    index('lead_activities_lead_idx').on(table.leadId),
    index('lead_activities_org_idx').on(table.organizationId),
    index('lead_activities_created_at_idx').on(table.createdAt),
  ],
);

export const leadNotes = pgTable(
  'lead_notes',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    body: text('body').notNull(),
    isInternal: boolean('is_internal').notNull().default(true),
    authorUserId: uuid('author_user_id').notNull(),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('lead_notes_lead_idx').on(table.leadId),
    index('lead_notes_org_idx').on(table.organizationId),
  ],
);

export const leadAssignments = pgTable(
  'lead_assignments',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    assignedToUserId: uuid('assigned_to_user_id').notNull(),
    assignedByUserId: uuid('assigned_by_user_id'),
    reason: text('reason'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    index('lead_assignments_lead_idx').on(table.leadId),
    index('lead_assignments_assignee_idx').on(table.assignedToUserId),
    index('lead_assignments_org_idx').on(table.organizationId),
  ],
);

export const leadTags = pgTable(
  'lead_tags',
  {
    ...idColumn,
    organizationId: uuid('organization_id').notNull(),
    name: text('name').notNull(),
    color: text('color'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    uniqueIndex('lead_tags_org_name_unique').on(
      table.organizationId,
      table.name,
    ),
    index('lead_tags_org_idx').on(table.organizationId),
  ],
);

export const leadTagLinks = pgTable(
  'lead_tag_links',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    tagId: uuid('tag_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex('lead_tag_links_unique').on(table.leadId, table.tagId),
    index('lead_tag_links_lead_idx').on(table.leadId),
    index('lead_tag_links_tag_idx').on(table.tagId),
  ],
);

export const leadReminders = pgTable(
  'lead_reminders',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    title: text('title').notNull(),
    dueAt: timestamp('due_at', { withTimezone: true, mode: 'date' }).notNull(),
    priority: leadPriorityEnum('priority').notNull().default('normal'),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    assignedToUserId: uuid('assigned_to_user_id'),
    isRecurring: boolean('is_recurring').notNull().default(false),
    recurrenceRule: text('recurrence_rule'),
    ...timestampColumns,
    ...versionColumn,
    ...auditStampColumns,
  },
  (table) => [
    index('lead_reminders_lead_idx').on(table.leadId),
    index('lead_reminders_due_at_idx').on(table.dueAt),
    index('lead_reminders_org_idx').on(table.organizationId),
  ],
);

export const leadScores = pgTable(
  'lead_scores',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    score: integer('score').notNull(),
    factors: jsonb('factors'),
    computedAt: timestamp('computed_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index('lead_scores_lead_idx').on(table.leadId),
    index('lead_scores_org_idx').on(table.organizationId),
  ],
);

export const leadStatusHistory = pgTable(
  'lead_status_history',
  {
    ...idColumn,
    leadId: uuid('lead_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    fromStatus: leadStatusEnum('from_status'),
    toStatus: leadStatusEnum('to_status').notNull(),
    changedByUserId: uuid('changed_by_user_id'),
    reason: text('reason'),
    ...timestampColumns,
  },
  (table) => [
    index('lead_status_history_lead_idx').on(table.leadId),
    index('lead_status_history_org_idx').on(table.organizationId),
    index('lead_status_history_created_at_idx').on(table.createdAt),
  ],
);
