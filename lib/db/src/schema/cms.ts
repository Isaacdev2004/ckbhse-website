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
import { users } from './foundation.js';

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
};

export const cmsContentTypeEnum = pgEnum('cms_content_type', [
  'site_config',
  'home',
  'hub',
  'corporate',
  'service',
  'industry',
  'course',
  'resource',
  'case_study',
  'testimonial',
  'client_success',
  'legal',
  'contact',
  'careers',
]);

export const cmsEntryStatusEnum = pgEnum('cms_entry_status', [
  'draft',
  'scheduled',
  'published',
  'archived',
]);

export const cmsEntries = pgTable(
  'cms_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contentType: cmsContentTypeEnum('content_type').notNull(),
    slug: text('slug').notNull(),
    path: text('path').notNull(),
    title: text('title').notNull(),
    status: cmsEntryStatusEnum('status').notNull().default('draft'),
    locale: text('locale').notNull().default('en-GB'),
    category: text('category'),
    segment: text('segment'),
    seo: jsonb('seo').notNull().default({}),
    reviewDueAt: timestamp('review_due_at', { withTimezone: true, mode: 'date' }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'date' }),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    currentVersionId: uuid('current_version_id'),
    publishedVersionId: uuid('published_version_id'),
    requiresClientApproval: boolean('requires_client_approval').notNull().default(false),
    clientApprovedAt: timestamp('client_approved_at', {
      withTimezone: true,
      mode: 'date',
    }),
    clientApprovedBy: uuid('client_approved_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex('cms_entries_path_locale_uidx').on(table.path, table.locale),
    index('cms_entries_content_type_idx').on(table.contentType),
    index('cms_entries_status_idx').on(table.status),
  ],
);

export const cmsEntryVersions = pgTable(
  'cms_entry_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => cmsEntries.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    payload: jsonb('payload').notNull(),
    changeSummary: text('change_summary'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('cms_entry_versions_entry_version_uidx').on(
      table.entryId,
      table.versionNumber,
    ),
    index('cms_entry_versions_entry_id_idx').on(table.entryId),
  ],
);

export const cmsMediaAssets = pgTable(
  'cms_media_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull(),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    altText: text('alt_text'),
    caption: text('caption'),
    storageKey: text('storage_key').notNull(),
    publicUrl: text('public_url').notNull(),
    usageCount: integer('usage_count').notNull().default(0),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('cms_media_assets_key_uidx').on(table.key),
    index('cms_media_assets_mime_type_idx').on(table.mimeType),
  ],
);
