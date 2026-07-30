import type { LearningRepositories } from './learning.service.js';
import { LearningService } from './learning.service.js';
import { EnrollmentService } from './enrollment.service.js';
import { AssessmentService } from './assessment.service.js';
import { CertificateService } from './certificate.service.js';
import { TrainerService } from './trainer.service.js';
import { TranscriptService } from './transcript.service.js';
import { LearningAnalyticsService } from './learning-analytics.service.js';
import { CPDService } from './cpd.service.js';
import { CourseRecommendationService } from './course-recommendation.service.js';
import { LearningNotificationService } from './learning-notification.service.js';
import type { DrizzleLearningStore } from '@workspace/data/stores/learning';
import type { CPDRepository } from '@workspace/data/repositories/cpd';
import type { AuthorizationContext } from '@workspace/platform/authorization';

export interface LearningServices {
  readonly learning: LearningService;
  readonly enrollment: EnrollmentService;
  readonly assessment: AssessmentService;
  readonly certificate: CertificateService;
  readonly trainer: TrainerService;
  readonly transcript: TranscriptService;
  readonly analytics: LearningAnalyticsService;
  readonly cpd: CPDService;
  readonly recommendations: CourseRecommendationService;
  readonly notifications: LearningNotificationService;
}

export function createLearningServices(deps: {
  repos: LearningRepositories;
  store: DrizzleLearningStore;
  cpd: CPDRepository;
}): LearningServices {
  const cpdService = new CPDService(deps.cpd);
  return {
    learning: new LearningService(deps.repos),
    enrollment: new EnrollmentService(deps.repos.enrollment, deps.store),
    assessment: new AssessmentService(deps.repos.assessment),
    certificate: new CertificateService(deps.repos.certificate),
    trainer: new TrainerService(deps.repos.trainer),
    transcript: new TranscriptService(
      deps.repos.transcript,
      deps.repos.enrollment,
      deps.repos.certificate,
      deps.cpd,
    ),
    analytics: new LearningAnalyticsService(deps.store, (ctx: AuthorizationContext) =>
      cpdService.sumHours(ctx),
    ),
    cpd: cpdService,
    recommendations: new CourseRecommendationService(deps.repos.enrollment),
    notifications: new LearningNotificationService(deps.store),
  };
}

export { LearningService } from './learning.service.js';
export { EnrollmentService } from './enrollment.service.js';
export { AssessmentService } from './assessment.service.js';
export { CertificateService } from './certificate.service.js';
export { TrainerService } from './trainer.service.js';
export { TranscriptService } from './transcript.service.js';
export { LearningAnalyticsService } from './learning-analytics.service.js';
export { CPDService } from './cpd.service.js';
export { CourseRecommendationService } from './course-recommendation.service.js';
export { LearningNotificationService } from './learning-notification.service.js';
