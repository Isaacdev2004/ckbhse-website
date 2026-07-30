import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
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

const versionColumn = { version: integer('version').notNull().default(1) };

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'pending_approval',
  'active',
  'waitlisted',
  'cancelled',
  'completed',
  'expired',
]);

export const enrollmentSourceEnum = pgEnum('enrollment_source', [
  'self',
  'manager',
  'administrator',
  'automatic',
  'mandatory',
  'bulk',
  'invitation',
]);

export const progressStatusEnum = pgEnum('progress_status', [
  'not_started',
  'started',
  'in_progress',
  'completed',
  'failed',
  'expired',
  'renewal_required',
  'abandoned',
]);

export const sessionDeliveryEnum = pgEnum('session_delivery', [
  'instructor_led',
  'virtual',
  'classroom',
  'on_site',
  'hybrid',
  'self_paced',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]);

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'registered',
  'present',
  'absent',
  'late',
  'cancelled',
  'completed',
]);

export const questionTypeEnum = pgEnum('question_type', [
  'multiple_choice',
  'true_false',
  'short_answer',
  'long_answer',
  'file_upload',
]);

export const certificateKindEnum = pgEnum('certificate_kind', [
  'course',
  'cpd',
  'compliance',
  'attendance',
]);

export const certificateStatusEnum = pgEnum('certificate_status', [
  'issued',
  'expired',
  'revoked',
  'renewal_required',
]);

export const learningPathways = pgTable(
  'learning_pathways',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    estimatedHours: integer('estimated_hours').notNull().default(0),
    certificationName: text('certification_name'),
    cpdHours: integer('cpd_hours').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [index('learning_pathways_org_idx').on(table.organizationId)],
);

export const learningPathwayCourses = pgTable('learning_pathway_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathwayId: uuid('pathway_id')
    .notNull()
    .references(() => learningPathways.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  courseCategory: text('course_category').notNull(),
  courseSlug: text('course_slug').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isMandatory: boolean('is_mandatory').notNull().default(true),
  prerequisiteCourseSlug: text('prerequisite_course_slug'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});

export const trainingEnrollments = pgTable(
  'training_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseCategory: text('course_category').notNull(),
    courseSlug: text('course_slug').notNull(),
    pathwayId: uuid('pathway_id').references(() => learningPathways.id, {
      onDelete: 'set null',
    }),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    source: enrollmentSourceEnum('source').notNull().default('self'),
    isMandatory: boolean('is_mandatory').notNull().default(false),
    assignedBy: uuid('assigned_by'),
    department: text('department'),
    site: text('site'),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('training_enrollments_org_user_idx').on(
      table.organizationId,
      table.userId,
    ),
    index('training_enrollments_course_idx').on(
      table.courseCategory,
      table.courseSlug,
    ),
  ],
);

export const trainingProgress = pgTable(
  'training_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => trainingEnrollments.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: progressStatusEnum('status').notNull().default('not_started'),
    completionPercent: integer('completion_percent').notNull().default(0),
    timeSpentMinutes: integer('time_spent_minutes').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at', {
      withTimezone: true,
      mode: 'date',
    }),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    bookmarked: boolean('bookmarked').notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    index('training_progress_enrollment_idx').on(table.enrollmentId),
  ],
);

export const courseSessions = pgTable(
  'course_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    courseCategory: text('course_category').notNull(),
    courseSlug: text('course_slug').notNull(),
    trainerId: uuid('trainer_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    delivery: sessionDeliveryEnum('delivery').notNull().default('virtual'),
    status: sessionStatusEnum('status').notNull().default('scheduled'),
    location: text('location'),
    meetingUrl: text('meeting_url'),
    capacity: integer('capacity').notNull().default(20),
    startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, mode: 'date' }).notNull(),
    resources: jsonb('resources').notNull().default([]),
    notes: text('notes'),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [index('course_sessions_org_idx').on(table.organizationId)],
);

export const courseAttendance = pgTable(
  'course_attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => courseSessions.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id'),
    status: attendanceStatusEnum('status').notNull().default('registered'),
    attendancePercent: integer('attendance_percent').notNull().default(0),
    trainerNotes: text('trainer_notes'),
    evidenceUrl: text('evidence_url'),
    checkedInAt: timestamp('checked_in_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ...timestampColumns,
  },
  (table) => [
    index('course_attendance_session_idx').on(table.sessionId),
  ],
);

export const courseAssessments = pgTable(
  'course_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    courseCategory: text('course_category').notNull(),
    courseSlug: text('course_slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    passingScore: integer('passing_score').notNull().default(70),
    maxAttempts: integer('max_attempts').notNull().default(3),
    timeLimitMinutes: integer('time_limit_minutes'),
    randomizeQuestions: boolean('randomize_questions').notNull().default(false),
    reviewMode: boolean('review_mode').notNull().default(true),
    isActive: boolean('is_active').notNull().default(true),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [index('course_assessments_org_idx').on(table.organizationId)],
);

export const assessmentQuestions = pgTable('assessment_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => courseAssessments.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  questionType: questionTypeEnum('question_type').notNull(),
  prompt: text('prompt').notNull(),
  options: jsonb('options').notNull().default([]),
  correctAnswer: text('correct_answer'),
  points: integer('points').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestampColumns,
});

export const assessmentAttempts = pgTable(
  'assessment_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => courseAssessments.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    score: integer('score'),
    passed: boolean('passed'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }),
    timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    index('assessment_attempts_user_idx').on(table.userId, table.assessmentId),
  ],
);

export const assessmentAnswers = pgTable('assessment_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => assessmentAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => assessmentQuestions.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  answer: text('answer'),
  isCorrect: boolean('is_correct'),
  pointsAwarded: integer('points_awarded').notNull().default(0),
  ...timestampColumns,
});

export const courseCertificates = pgTable(
  'course_certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrollmentId: uuid('enrollment_id'),
    courseCategory: text('course_category').notNull(),
    courseSlug: text('course_slug').notNull(),
    certificateNumber: text('certificate_number').notNull(),
    kind: certificateKindEnum('kind').notNull().default('course'),
    status: certificateStatusEnum('status').notNull().default('issued'),
    issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    verificationCode: text('verification_code'),
    downloadUrl: text('download_url'),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    ...timestampColumns,
    ...versionColumn,
  },
  (table) => [
    index('course_certificates_org_user_idx').on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export const cpdRecords = pgTable(
  'cpd_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseCategory: text('course_category'),
    courseSlug: text('course_slug'),
    category: text('category').notNull(),
    hours: numeric('hours', { precision: 6, scale: 2 }).notNull(),
    earnedAt: timestamp('earned_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    renewalDueAt: timestamp('renewal_due_at', {
      withTimezone: true,
      mode: 'date',
    }),
    certificateId: uuid('certificate_id'),
    notes: text('notes'),
    ...timestampColumns,
  },
  (table) => [
    index('cpd_records_org_user_idx').on(table.organizationId, table.userId),
  ],
);

export const trainerAssignments = pgTable(
  'trainer_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseCategory: text('course_category').notNull(),
    courseSlug: text('course_slug').notNull(),
    isPrimary: boolean('is_primary').notNull().default(true),
    assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    index('trainer_assignments_trainer_idx').on(table.trainerId),
  ],
);

export const courseFeedback = pgTable('course_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseCategory: text('course_category').notNull(),
  courseSlug: text('course_slug').notNull(),
  enrollmentId: uuid('enrollment_id'),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  ...timestampColumns,
});

export const learningNotifications = pgTable('learning_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  notificationType: text('notification_type').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  actionPath: text('action_path'),
  readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});

export const learningTranscripts = pgTable('learning_transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  summary: jsonb('summary').notNull().default({}),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
  ...timestampColumns,
});
