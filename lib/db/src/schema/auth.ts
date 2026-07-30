import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './foundation.js';

const idColumn = { id: uuid('id').primaryKey().defaultRandom() };

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
};

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    ...idColumn,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
    requestedIp: text('requested_ip'),
    ...timestampColumns,
  },
  (table) => [
    index('password_reset_tokens_user_idx').on(table.userId),
    index('password_reset_tokens_hash_idx').on(table.tokenHash),
    index('password_reset_tokens_expires_idx').on(table.expiresAt),
  ],
);

export const passwordHistory = pgTable(
  'password_history',
  {
    ...idColumn,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    passwordHash: text('password_hash').notNull(),
    ...timestampColumns,
  },
  (table) => [index('password_history_user_idx').on(table.userId)],
);

/** Placeholder for future MFA enrolment (M2.3 foundation). */
export const mfaEnrolments = pgTable(
  'mfa_enrolments',
  {
    ...idColumn,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    method: text('method').notNull(),
    secretEncrypted: text('secret_encrypted'),
    verifiedAt: timestamp('verified_at', {
      withTimezone: true,
      mode: 'date',
    }),
    disabledAt: timestamp('disabled_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
  },
  (table) => [
    index('mfa_enrolments_user_idx').on(table.userId),
    index('mfa_enrolments_method_idx').on(table.method),
  ],
);

export const mfaBackupCodes = pgTable(
  'mfa_backup_codes',
  {
    ...idColumn,
    enrolmentId: uuid('enrolment_id')
      .notNull()
      .references(() => mfaEnrolments.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
  },
  (table) => [index('mfa_backup_codes_enrolment_idx').on(table.enrolmentId)],
);

export const sessionPermissionCache = pgTable('session_permission_cache', {
  sessionId: uuid('session_id').primaryKey(),
  permissions: text('permissions').notNull(),
  resolvedAt: timestamp('resolved_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
