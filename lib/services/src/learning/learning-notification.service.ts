import type { DrizzleLearningStore } from '@workspace/data/stores/learning';

export type LearningNotificationType =
  | 'training.enrollment.confirmed'
  | 'training.course.reminder'
  | 'training.session.reminder'
  | 'training.assessment.due'
  | 'training.certificate.expiry'
  | 'training.learning.assigned'
  | 'training.learning.completed'
  | 'training.manager.approval'
  | 'training.feedback.request';

export interface LearningNotificationInput {
  readonly organizationId: string;
  readonly userId: string;
  readonly type: LearningNotificationType;
  readonly subject: string;
  readonly body: string;
  readonly actionPath?: string;
}

export class LearningNotificationService {
  constructor(private readonly store: DrizzleLearningStore) {}

  async notify(input: LearningNotificationInput) {
    return this.store.createNotification({
      organizationId: input.organizationId,
      userId: input.userId,
      notificationType: input.type,
      subject: input.subject,
      body: input.body,
      actionPath: input.actionPath ?? null,
    });
  }
}
