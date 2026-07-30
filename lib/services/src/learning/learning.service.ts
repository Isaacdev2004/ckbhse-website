import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { EnrollmentRepository } from '@workspace/data/repositories/enrollment';
import type { LearningRepository } from '@workspace/data/repositories/learning';
import type { AssessmentRepository } from '@workspace/data/repositories/assessment';
import type { CertificateRepository } from '@workspace/data/repositories/certificate';
import type { SessionRepository } from '@workspace/data/repositories/session';
import type { CPDRepository } from '@workspace/data/repositories/cpd';
import type { TranscriptRepository } from '@workspace/data/repositories/transcript';
import type { TrainerRepository } from '@workspace/data/repositories/trainer';
import { contentLoader } from '@workspace/content/loader';
import {
  filterTrainingCatalog,
  toTrainingCatalogItem,
} from '@workspace/content/training/catalog';
import type { TrainingFilterOptions } from '@workspace/content/training/catalog';

export interface LearningRepositories {
  readonly enrollment: EnrollmentRepository;
  readonly learning: LearningRepository;
  readonly assessment: AssessmentRepository;
  readonly certificate: CertificateRepository;
  readonly session: SessionRepository;
  readonly cpd: CPDRepository;
  readonly transcript: TranscriptRepository;
  readonly trainer: TrainerRepository;
}

export interface LearningDashboardData {
  readonly currentEnrollments: number;
  readonly completedCourses: number;
  readonly inProgressCourses: number;
  readonly mandatoryCourses: number;
  readonly complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
  readonly upcomingSessions: readonly {
    readonly id: string;
    readonly title: string;
    readonly startsAt: string;
    readonly delivery: string;
  }[];
  readonly expiringCertificates: number;
  readonly cpdHoursEarned: number;
  readonly cpdHoursRequired: number;
  readonly pathwayProgress: readonly {
    readonly id: string;
    readonly title: string;
    readonly completionPercent: number;
  }[];
  readonly recentAchievements: readonly {
    readonly certificateNumber: string;
    readonly courseSlug: string;
    readonly issuedAt: string;
  }[];
  readonly notifications: readonly {
    readonly id: string;
    readonly subject: string;
    readonly createdAt: string;
  }[];
}

export class LearningService {
  constructor(private readonly repos: LearningRepositories) {}

  async getDashboard(context: AuthorizationContext): Promise<LearningDashboardData> {
    const userId = context.userId!;

    const [
      enrollments,
      progress,
      sessions,
      expiring,
      cpdHours,
      certificates,
      pathways,
    ] = await Promise.all([
      this.repos.enrollment.list(context, { userId }),
      this.repos.learning.listProgress(context),
      this.repos.session.list(context, { upcomingOnly: true }),
      this.repos.certificate.countExpiring(context),
      this.repos.cpd.sumHours(context),
      this.repos.certificate.list(context, userId),
      this.repos.learning.listPathways(context),
    ]);

    const active = enrollments.filter((e) => e.status === 'active');
    const mandatory = enrollments.filter((e) => e.isMandatory);
    const completed = progress.filter((p) => p.status === 'completed');
    const inProgress = progress.filter((p) => p.status === 'in_progress' || p.status === 'started');

    const mandatoryIncomplete = mandatory.filter((m) => {
      const prog = progress.find((p) => p.enrollmentId === m.id);
      return prog === undefined || prog.status !== 'completed';
    });

    let complianceStatus: LearningDashboardData['complianceStatus'] = 'compliant';
    if (mandatoryIncomplete.length > 0) {
      complianceStatus =
        mandatoryIncomplete.length >= mandatory.length ? 'non_compliant' : 'at_risk';
    }

    const pathwayProgress = await Promise.all(
      pathways.slice(0, 5).map(async (pathway) => {
        const courses = await this.repos.learning.listPathwayCourses(
          context,
          pathway.id,
        );
        const enrolled = enrollments.filter((e) => e.pathwayId === pathway.id);
        const completedCount = enrolled.filter((e) => {
          const prog = progress.find((p) => p.enrollmentId === e.id);
          return prog?.status === 'completed';
        }).length;
        const completionPercent =
          courses.length > 0
            ? Math.round((completedCount / courses.length) * 100)
            : 0;
        return {
          id: pathway.id,
          title: pathway.title,
          completionPercent,
        };
      }),
    );

    return {
      currentEnrollments: active.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      mandatoryCourses: mandatory.length,
      complianceStatus,
      upcomingSessions: sessions.slice(0, 5).map((s) => ({
        id: s.id,
        title: s.title,
        startsAt: s.startsAt.toISOString(),
        delivery: s.delivery,
      })),
      expiringCertificates: expiring,
      cpdHoursEarned: cpdHours,
      cpdHoursRequired: 35,
      pathwayProgress,
      recentAchievements: certificates.slice(0, 5).map((c) => ({
        certificateNumber: c.certificateNumber,
        courseSlug: c.courseSlug,
        issuedAt: c.issuedAt.toISOString(),
      })),
      notifications: [],
    };
  }

  getCatalogue(filters: TrainingFilterOptions = {}) {
    const catalog = contentLoader.getTrainingCatalog();
    return filterTrainingCatalog(catalog, filters);
  }

  getCourse(category: string, slug: string) {
    const course = contentLoader.getCoursePage(
      category as never,
      slug,
    );
    if (course === null) return null;
    return {
      ...toTrainingCatalogItem(course),
      content: course,
    };
  }

  listPathways(context: AuthorizationContext) {
    return this.repos.learning.listPathways(context);
  }

  async getPathwayDetail(context: AuthorizationContext, pathwayId: string) {
    const pathway = await this.repos.learning.getPathway(context, pathwayId);
    if (pathway === null) return null;
    const courses = await this.repos.learning.listPathwayCourses(
      context,
      pathwayId,
    );
    const enriched = courses.map((c) => {
      const page = contentLoader.getCoursePage(
        c.courseCategory as never,
        c.courseSlug,
      );
      return {
        ...c,
        title: page?.title ?? c.courseSlug,
        duration: page?.duration ?? null,
      };
    });
    return { pathway, courses: enriched };
  }

  search(context: AuthorizationContext, keyword: string) {
    return this.repos.learning.search(context, keyword);
  }

  listSessions(
    context: AuthorizationContext,
    filters?: { upcomingOnly?: boolean },
  ) {
    return this.repos.session.list(context, filters);
  }

  updateProgress(
    context: AuthorizationContext,
    input: {
      enrollmentId: string;
      status?: string;
      completionPercent?: number;
      timeSpentMinutes?: number;
      bookmarked?: boolean;
    },
  ) {
    return this.repos.learning.updateProgress(context, {
      enrollmentId: input.enrollmentId,
      status: (input.status as never) ?? 'in_progress',
      completionPercent: input.completionPercent ?? 0,
      timeSpentMinutes: input.timeSpentMinutes ?? 0,
      attempts: 0,
      bookmarked: input.bookmarked ?? false,
      lastActivityAt: new Date(),
      startedAt: new Date(),
    });
  }
}
