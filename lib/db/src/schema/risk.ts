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

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

export const riskAssessmentStatusEnum = pgEnum('risk_assessment_status', [
  'draft', 'active', 'under_review', 'approved', 'archived',
]);

export const riskAssessmentTypeEnum = pgEnum('risk_assessment_type', [
  'general', 'workplace', 'project', 'activity', 'bowtie',
]);

export const hazardCategoryEnum = pgEnum('hazard_category', [
  'physical', 'chemical', 'biological', 'ergonomic', 'psychosocial', 'environmental', 'other',
]);

export const hazardStatusEnum = pgEnum('hazard_status', [
  'identified', 'assessed', 'controlled', 'monitored', 'closed',
]);

export const riskTreatmentTypeEnum = pgEnum('risk_treatment_type', [
  'eliminate', 'substitute', 'engineer', 'administrative', 'ppe', 'transfer',
]);

export const riskTreatmentStatusEnum = pgEnum('risk_treatment_status', [
  'planned', 'in_progress', 'completed', 'verified',
]);

export const riskReviewOutcomeEnum = pgEnum('risk_review_outcome', [
  'acceptable', 'requires_action', 'escalate',
]);

export const bowtieElementTypeEnum = pgEnum('bowtie_element_type', [
  'threat', 'top_event', 'consequence', 'preventive_barrier', 'recovery_barrier',
]);

export const riskMatrixConfigs = pgTable('risk_matrix_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  likelihoodLevels: jsonb('likelihood_levels').notNull().default([]),
  severityLevels: jsonb('severity_levels').notNull().default([]),
  ratingThresholds: jsonb('rating_thresholds').notNull().default([]),
  isDefault: boolean('is_default').notNull().default(false),
  ...timestampColumns,
});

export const riskAssessments = pgTable(
  'risk_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    assessmentNumber: text('assessment_number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    assessmentType: riskAssessmentTypeEnum('assessment_type').notNull().default('workplace'),
    status: riskAssessmentStatusEnum('status').notNull().default('draft'),
    site: text('site'),
    department: text('department'),
    activity: text('activity'),
    matrixConfigId: uuid('matrix_config_id').references(() => riskMatrixConfigs.id, { onDelete: 'set null' }),
    inherentLikelihood: integer('inherent_likelihood'),
    inherentSeverity: integer('inherent_severity'),
    inherentScore: integer('inherent_score'),
    inherentRating: text('inherent_rating'),
    residualLikelihood: integer('residual_likelihood'),
    residualSeverity: integer('residual_severity'),
    residualScore: integer('residual_score'),
    residualRating: text('residual_rating'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    reviewDueDate: timestamp('review_due_date', { withTimezone: true, mode: 'date' }),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    approvedBy: uuid('approved_by'),
    ...timestampColumns,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    version: integer('version').notNull().default(1),
  },
  (t) => [
    index('risk_assessments_org_idx').on(t.organizationId),
    index('risk_assessments_status_idx').on(t.status),
  ],
);

export const hazardRegister = pgTable(
  'hazard_register',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    hazardNumber: text('hazard_number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: hazardCategoryEnum('category').notNull().default('physical'),
    status: hazardStatusEnum('status').notNull().default('identified'),
    riskAssessmentId: uuid('risk_assessment_id').references(() => riskAssessments.id, { onDelete: 'set null' }),
    location: text('location'),
    activity: text('activity'),
    existingControls: jsonb('existing_controls').notNull().default([]),
    inherentLikelihood: integer('inherent_likelihood'),
    inherentSeverity: integer('inherent_severity'),
    inherentScore: integer('inherent_score'),
    inherentRating: text('inherent_rating'),
    residualLikelihood: integer('residual_likelihood'),
    residualSeverity: integer('residual_severity'),
    residualScore: integer('residual_score'),
    residualRating: text('residual_rating'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    reviewDueDate: timestamp('review_due_date', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (t) => [
    index('hazard_register_org_idx').on(t.organizationId),
    index('hazard_register_assessment_idx').on(t.riskAssessmentId),
  ],
);

export const riskTreatmentPlans = pgTable('risk_treatment_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  riskAssessmentId: uuid('risk_assessment_id').references(() => riskAssessments.id, { onDelete: 'cascade' }),
  hazardId: uuid('hazard_id').references(() => hazardRegister.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  treatmentType: riskTreatmentTypeEnum('treatment_type').notNull().default('administrative'),
  status: riskTreatmentStatusEnum('status').notNull().default('planned'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  dueDate: timestamp('due_date', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  effectivenessNotes: text('effectiveness_notes'),
  ...timestampColumns,
});

export const riskReviews = pgTable('risk_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  riskAssessmentId: uuid('risk_assessment_id').notNull().references(() => riskAssessments.id, { onDelete: 'cascade' }),
  reviewDate: timestamp('review_date', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  reviewedBy: uuid('reviewed_by'),
  outcome: riskReviewOutcomeEnum('outcome').notNull().default('acceptable'),
  notes: text('notes'),
  nextReviewDate: timestamp('next_review_date', { withTimezone: true, mode: 'date' }),
  createdAt: timestampColumns.createdAt,
});

export const riskBowtieElements = pgTable('risk_bowtie_elements', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  riskAssessmentId: uuid('risk_assessment_id').notNull().references(() => riskAssessments.id, { onDelete: 'cascade' }),
  elementType: bowtieElementTypeEnum('element_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  linkedElementId: uuid('linked_element_id'),
  effectiveness: text('effectiveness'),
  position: jsonb('position').notNull().default({}),
  ...timestampColumns,
});
