import type { Database } from '@workspace/db';
import {
  assessmentAnswers,
  assessmentAttempts,
  assessmentQuestions,
  courseAssessments,
  courseAttendance,
  courseCertificates,
  courseSessions,
  cpdRecords,
  learningNotifications,
  learningPathwayCourses,
  learningPathways,
  learningTranscripts,
  trainerAssignments,
  trainingEnrollments,
  trainingProgress,
} from '@workspace/db/schema';
import { and, asc, desc, eq, gte, ilike, isNull, lte, or, sql } from 'drizzle-orm';

export class DrizzleLearningStore {
  constructor(private readonly db: Database) {}

  async listPathways(organizationId: string) {
    return this.db
      .select()
      .from(learningPathways)
      .where(
        and(
          eq(learningPathways.organizationId, organizationId),
          isNull(learningPathways.deletedAt),
          eq(learningPathways.isActive, true),
        ),
      )
      .orderBy(asc(learningPathways.title));
  }

  async getPathway(organizationId: string, pathwayId: string) {
    const [row] = await this.db
      .select()
      .from(learningPathways)
      .where(
        and(
          eq(learningPathways.id, pathwayId),
          eq(learningPathways.organizationId, organizationId),
          isNull(learningPathways.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listPathwayCourses(pathwayId: string) {
    return this.db
      .select()
      .from(learningPathwayCourses)
      .where(eq(learningPathwayCourses.pathwayId, pathwayId))
      .orderBy(asc(learningPathwayCourses.sortOrder));
  }

  async listEnrollments(
    organizationId: string,
    filters?: {
      userId?: string;
      status?: string;
      mandatoryOnly?: boolean;
    },
  ) {
    const conditions = [
      eq(trainingEnrollments.organizationId, organizationId),
      isNull(trainingEnrollments.deletedAt),
    ];
    if (filters?.userId !== undefined) {
      conditions.push(eq(trainingEnrollments.userId, filters.userId));
    }
    if (filters?.status !== undefined) {
      conditions.push(eq(trainingEnrollments.status, filters.status as never));
    }
    if (filters?.mandatoryOnly === true) {
      conditions.push(eq(trainingEnrollments.isMandatory, true));
    }
    return this.db
      .select()
      .from(trainingEnrollments)
      .where(and(...conditions))
      .orderBy(desc(trainingEnrollments.enrolledAt));
  }

  async getEnrollment(organizationId: string, enrollmentId: string) {
    const [row] = await this.db
      .select()
      .from(trainingEnrollments)
      .where(
        and(
          eq(trainingEnrollments.id, enrollmentId),
          eq(trainingEnrollments.organizationId, organizationId),
          isNull(trainingEnrollments.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createEnrollment(
    input: typeof trainingEnrollments.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(trainingEnrollments)
      .values(input)
      .returning();
    return row!;
  }

  async updateEnrollment(
    organizationId: string,
    enrollmentId: string,
    patch: Partial<typeof trainingEnrollments.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(trainingEnrollments)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(trainingEnrollments.id, enrollmentId),
          eq(trainingEnrollments.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async getProgressByEnrollment(enrollmentId: string) {
    const [row] = await this.db
      .select()
      .from(trainingProgress)
      .where(eq(trainingProgress.enrollmentId, enrollmentId))
      .limit(1);
    return row ?? null;
  }

  async listProgress(organizationId: string, userId: string) {
    return this.db
      .select()
      .from(trainingProgress)
      .where(
        and(
          eq(trainingProgress.organizationId, organizationId),
          eq(trainingProgress.userId, userId),
        ),
      )
      .orderBy(desc(trainingProgress.lastActivityAt));
  }

  async upsertProgress(
    input: typeof trainingProgress.$inferInsert,
  ) {
    const existing = await this.getProgressByEnrollment(input.enrollmentId);
    if (existing !== null) {
      const [row] = await this.db
        .update(trainingProgress)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(trainingProgress.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await this.db
      .insert(trainingProgress)
      .values(input)
      .returning();
    return row!;
  }

  async listSessions(
    organizationId: string,
    filters?: { upcomingOnly?: boolean; courseCategory?: string; courseSlug?: string },
  ) {
    const conditions = [
      eq(courseSessions.organizationId, organizationId),
      isNull(courseSessions.deletedAt),
    ];
    if (filters?.courseCategory !== undefined) {
      conditions.push(eq(courseSessions.courseCategory, filters.courseCategory));
    }
    if (filters?.courseSlug !== undefined) {
      conditions.push(eq(courseSessions.courseSlug, filters.courseSlug));
    }
    if (filters?.upcomingOnly === true) {
      conditions.push(gte(courseSessions.startsAt, new Date()));
    }
    return this.db
      .select()
      .from(courseSessions)
      .where(and(...conditions))
      .orderBy(asc(courseSessions.startsAt));
  }

  async getSession(organizationId: string, sessionId: string) {
    const [row] = await this.db
      .select()
      .from(courseSessions)
      .where(
        and(
          eq(courseSessions.id, sessionId),
          eq(courseSessions.organizationId, organizationId),
          isNull(courseSessions.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listAttendance(sessionId: string) {
    return this.db
      .select()
      .from(courseAttendance)
      .where(eq(courseAttendance.sessionId, sessionId))
      .orderBy(asc(courseAttendance.createdAt));
  }

  async listUserAttendance(organizationId: string, userId: string) {
    return this.db
      .select()
      .from(courseAttendance)
      .where(
        and(
          eq(courseAttendance.organizationId, organizationId),
          eq(courseAttendance.userId, userId),
        ),
      );
  }

  async updateAttendance(
    organizationId: string,
    attendanceId: string,
    patch: Partial<typeof courseAttendance.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(courseAttendance)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(courseAttendance.id, attendanceId),
          eq(courseAttendance.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async listAssessments(organizationId: string, courseCategory?: string, courseSlug?: string) {
    const conditions = [
      eq(courseAssessments.organizationId, organizationId),
      isNull(courseAssessments.deletedAt),
      eq(courseAssessments.isActive, true),
    ];
    if (courseCategory !== undefined) {
      conditions.push(eq(courseAssessments.courseCategory, courseCategory));
    }
    if (courseSlug !== undefined) {
      conditions.push(eq(courseAssessments.courseSlug, courseSlug));
    }
    return this.db
      .select()
      .from(courseAssessments)
      .where(and(...conditions))
      .orderBy(asc(courseAssessments.title));
  }

  async getAssessment(organizationId: string, assessmentId: string) {
    const [row] = await this.db
      .select()
      .from(courseAssessments)
      .where(
        and(
          eq(courseAssessments.id, assessmentId),
          eq(courseAssessments.organizationId, organizationId),
          isNull(courseAssessments.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listQuestions(assessmentId: string) {
    return this.db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentId, assessmentId))
      .orderBy(asc(assessmentQuestions.sortOrder));
  }

  async createAttempt(input: typeof assessmentAttempts.$inferInsert) {
    const [row] = await this.db
      .insert(assessmentAttempts)
      .values(input)
      .returning();
    return row!;
  }

  async getAttempt(organizationId: string, attemptId: string) {
    const [row] = await this.db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.id, attemptId),
          eq(assessmentAttempts.organizationId, organizationId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listAttempts(organizationId: string, userId: string, assessmentId?: string) {
    const conditions = [
      eq(assessmentAttempts.organizationId, organizationId),
      eq(assessmentAttempts.userId, userId),
    ];
    if (assessmentId !== undefined) {
      conditions.push(eq(assessmentAttempts.assessmentId, assessmentId));
    }
    return this.db
      .select()
      .from(assessmentAttempts)
      .where(and(...conditions))
      .orderBy(desc(assessmentAttempts.startedAt));
  }

  async submitAttempt(
    organizationId: string,
    attemptId: string,
    patch: Partial<typeof assessmentAttempts.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(assessmentAttempts)
      .set({ ...patch, updatedAt: new Date() })
      .where(
        and(
          eq(assessmentAttempts.id, attemptId),
          eq(assessmentAttempts.organizationId, organizationId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async createAnswers(answers: (typeof assessmentAnswers.$inferInsert)[]) {
    if (answers.length === 0) return [];
    return this.db.insert(assessmentAnswers).values(answers).returning();
  }

  async listCertificates(organizationId: string, userId?: string) {
    const conditions = [
      eq(courseCertificates.organizationId, organizationId),
      isNull(courseCertificates.deletedAt),
    ];
    if (userId !== undefined) {
      conditions.push(eq(courseCertificates.userId, userId));
    }
    return this.db
      .select()
      .from(courseCertificates)
      .where(and(...conditions))
      .orderBy(desc(courseCertificates.issuedAt));
  }

  async getCertificate(organizationId: string, certificateId: string) {
    const [row] = await this.db
      .select()
      .from(courseCertificates)
      .where(
        and(
          eq(courseCertificates.id, certificateId),
          eq(courseCertificates.organizationId, organizationId),
          isNull(courseCertificates.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createCertificate(input: typeof courseCertificates.$inferInsert) {
    const [row] = await this.db
      .insert(courseCertificates)
      .values(input)
      .returning();
    return row!;
  }

  async countExpiringCertificates(organizationId: string, withinDays = 90) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + withinDays);
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(courseCertificates)
      .where(
        and(
          eq(courseCertificates.organizationId, organizationId),
          isNull(courseCertificates.deletedAt),
          eq(courseCertificates.status, 'issued'),
          lte(courseCertificates.expiresAt, deadline),
          gte(courseCertificates.expiresAt, new Date()),
        ),
      );
    return row?.count ?? 0;
  }

  async listCpdRecords(organizationId: string, userId?: string) {
    const conditions = [eq(cpdRecords.organizationId, organizationId)];
    if (userId !== undefined) {
      conditions.push(eq(cpdRecords.userId, userId));
    }
    return this.db
      .select()
      .from(cpdRecords)
      .where(and(...conditions))
      .orderBy(desc(cpdRecords.earnedAt));
  }

  async createCpdRecord(input: typeof cpdRecords.$inferInsert) {
    const [row] = await this.db.insert(cpdRecords).values(input).returning();
    return row!;
  }

  async sumCpdHours(organizationId: string, userId: string, year?: number) {
    const conditions = [
      eq(cpdRecords.organizationId, organizationId),
      eq(cpdRecords.userId, userId),
    ];
    if (year !== undefined) {
      conditions.push(
        sql`extract(year from ${cpdRecords.earnedAt}) = ${year}`,
      );
    }
    const [row] = await this.db
      .select({ total: sql<string>`coalesce(sum(${cpdRecords.hours}), 0)` })
      .from(cpdRecords)
      .where(and(...conditions));
    return Number(row?.total ?? 0);
  }

  async listTrainerAssignments(organizationId: string, trainerId?: string) {
    const conditions = [
      eq(trainerAssignments.organizationId, organizationId),
      isNull(trainerAssignments.deletedAt),
    ];
    if (trainerId !== undefined) {
      conditions.push(eq(trainerAssignments.trainerId, trainerId));
    }
    return this.db
      .select()
      .from(trainerAssignments)
      .where(and(...conditions))
      .orderBy(desc(trainerAssignments.assignedAt));
  }

  async getTranscript(organizationId: string, userId: string) {
    const [row] = await this.db
      .select()
      .from(learningTranscripts)
      .where(
        and(
          eq(learningTranscripts.organizationId, organizationId),
          eq(learningTranscripts.userId, userId),
        ),
      )
      .orderBy(desc(learningTranscripts.generatedAt))
      .limit(1);
    return row ?? null;
  }

  async upsertTranscript(
    input: typeof learningTranscripts.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(learningTranscripts)
      .values(input)
      .returning();
    return row!;
  }

  async listNotifications(organizationId: string, userId: string) {
    return this.db
      .select()
      .from(learningNotifications)
      .where(
        and(
          eq(learningNotifications.organizationId, organizationId),
          eq(learningNotifications.userId, userId),
        ),
      )
      .orderBy(desc(learningNotifications.createdAt))
      .limit(50);
  }

  async createNotification(input: typeof learningNotifications.$inferInsert) {
    const [row] = await this.db
      .insert(learningNotifications)
      .values(input)
      .returning();
    return row!;
  }

  async analyticsCounts(organizationId: string) {
    const [enrollments] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(trainingEnrollments)
      .where(
        and(
          eq(trainingEnrollments.organizationId, organizationId),
          isNull(trainingEnrollments.deletedAt),
        ),
      );
    const [completed] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(trainingProgress)
      .where(
        and(
          eq(trainingProgress.organizationId, organizationId),
          eq(trainingProgress.status, 'completed'),
        ),
      );
    const [passedAttempts] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.organizationId, organizationId),
          eq(assessmentAttempts.passed, true),
        ),
      );
    const [avgScore] = await this.db
      .select({ avg: sql<number>`coalesce(avg(${assessmentAttempts.score}), 0)` })
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.organizationId, organizationId),
          sql`${assessmentAttempts.score} is not null`,
        ),
      );
    return {
      totalEnrollments: enrollments?.count ?? 0,
      completedCourses: completed?.count ?? 0,
      passedAssessments: passedAttempts?.count ?? 0,
      averageScore: Math.round(avgScore?.avg ?? 0),
    };
  }

  async searchLearning(
    organizationId: string,
    keyword: string,
    userId?: string,
  ) {
    const pattern = `%${keyword}%`;
    const enrollments = await this.db
      .select()
      .from(trainingEnrollments)
      .where(
        and(
          eq(trainingEnrollments.organizationId, organizationId),
          isNull(trainingEnrollments.deletedAt),
          ...(userId !== undefined
            ? [eq(trainingEnrollments.userId, userId)]
            : []),
          or(
            ilike(trainingEnrollments.courseSlug, pattern),
            ilike(trainingEnrollments.courseCategory, pattern),
          )!,
        ),
      )
      .limit(20);
    const pathways = await this.db
      .select()
      .from(learningPathways)
      .where(
        and(
          eq(learningPathways.organizationId, organizationId),
          isNull(learningPathways.deletedAt),
          or(
            ilike(learningPathways.title, pattern),
            ilike(learningPathways.slug, pattern),
          )!,
        ),
      )
      .limit(20);
    const certificates = await this.db
      .select()
      .from(courseCertificates)
      .where(
        and(
          eq(courseCertificates.organizationId, organizationId),
          isNull(courseCertificates.deletedAt),
          ...(userId !== undefined
            ? [eq(courseCertificates.userId, userId)]
            : []),
          or(
            ilike(courseCertificates.courseSlug, pattern),
            ilike(courseCertificates.certificateNumber, pattern),
          )!,
        ),
      )
      .limit(20);
    return { enrollments, pathways, certificates };
  }
}
