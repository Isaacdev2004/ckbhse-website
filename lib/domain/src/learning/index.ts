/** Learning Management System domain types (M2.5). */

export type EnrollmentStatus =
  | 'pending_approval'
  | 'active'
  | 'waitlisted'
  | 'cancelled'
  | 'completed'
  | 'expired';

export type EnrollmentSource =
  | 'self'
  | 'manager'
  | 'administrator'
  | 'automatic'
  | 'mandatory'
  | 'bulk'
  | 'invitation';

export type ProgressStatus =
  | 'not_started'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'renewal_required'
  | 'abandoned';

export type SessionDelivery =
  | 'instructor_led'
  | 'virtual'
  | 'classroom'
  | 'on_site'
  | 'hybrid'
  | 'self_paced';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type AttendanceStatus =
  | 'registered'
  | 'present'
  | 'absent'
  | 'late'
  | 'cancelled'
  | 'completed';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'file_upload';

export type CertificateKind = 'course' | 'cpd' | 'compliance' | 'attendance';

export type CertificateStatus =
  | 'issued'
  | 'expired'
  | 'revoked'
  | 'renewal_required';

/** Reference to M1 training content — no duplication. */
export interface CourseRef {
  readonly courseCategory: string;
  readonly courseSlug: string;
}

export interface LearningPathway {
  readonly id: string;
  readonly organizationId: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string | null;
  readonly estimatedHours: number;
  readonly certificationName: string | null;
  readonly cpdHours: number;
  readonly isActive: boolean;
}

export interface LearningPathwayCourse extends CourseRef {
  readonly id: string;
  readonly pathwayId: string;
  readonly organizationId: string;
  readonly sortOrder: number;
  readonly isMandatory: boolean;
  readonly prerequisiteCourseSlug: string | null;
}

export interface TrainingEnrollment extends CourseRef {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly pathwayId: string | null;
  readonly status: EnrollmentStatus;
  readonly source: EnrollmentSource;
  readonly isMandatory: boolean;
  readonly assignedBy: string | null;
  readonly department: string | null;
  readonly site: string | null;
  readonly enrolledAt: Date;
  readonly completedAt: Date | null;
}

export interface TrainingProgress {
  readonly id: string;
  readonly enrollmentId: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly status: ProgressStatus;
  readonly completionPercent: number;
  readonly timeSpentMinutes: number;
  readonly attempts: number;
  readonly lastActivityAt: Date | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly bookmarked: boolean;
}

export interface CourseSession extends CourseRef {
  readonly id: string;
  readonly organizationId: string;
  readonly trainerId: string | null;
  readonly title: string;
  readonly delivery: SessionDelivery;
  readonly status: SessionStatus;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly capacity: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
}

export interface CourseAttendance {
  readonly id: string;
  readonly sessionId: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly enrollmentId: string | null;
  readonly status: AttendanceStatus;
  readonly attendancePercent: number;
  readonly trainerNotes: string | null;
}

export interface CourseAssessment extends CourseRef {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly description: string | null;
  readonly passingScore: number;
  readonly maxAttempts: number;
  readonly timeLimitMinutes: number | null;
  readonly randomizeQuestions: boolean;
  readonly reviewMode: boolean;
  readonly isActive: boolean;
}

export interface AssessmentQuestion {
  readonly id: string;
  readonly assessmentId: string;
  readonly organizationId: string;
  readonly questionType: QuestionType;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly points: number;
  readonly sortOrder: number;
}

export interface AssessmentAttempt {
  readonly id: string;
  readonly assessmentId: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly enrollmentId: string | null;
  readonly attemptNumber: number;
  readonly score: number | null;
  readonly passed: boolean | null;
  readonly startedAt: Date;
  readonly submittedAt: Date | null;
  readonly timeSpentSeconds: number;
}

export interface CourseCertificate extends CourseRef {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly enrollmentId: string | null;
  readonly certificateNumber: string;
  readonly kind: CertificateKind;
  readonly status: CertificateStatus;
  readonly issuedAt: Date;
  readonly expiresAt: Date | null;
  readonly verificationCode: string | null;
  readonly downloadUrl: string | null;
}

export interface CpdRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly courseCategory: string | null;
  readonly courseSlug: string | null;
  readonly category: string;
  readonly hours: number;
  readonly earnedAt: Date;
  readonly renewalDueAt: Date | null;
}

export interface TrainerAssignment extends CourseRef {
  readonly id: string;
  readonly organizationId: string;
  readonly trainerId: string;
  readonly isPrimary: boolean;
  readonly assignedAt: Date;
}

export interface LearningNotification {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly notificationType: string;
  readonly subject: string;
  readonly body: string;
  readonly actionPath: string | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}
