import type { JobRegistry, Job } from '@workspace/platform/jobs';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import type { Permission } from '@workspace/platform/permissions';
import type { CmsService } from './cms.service.js';

export const CMS_SCHEDULED_PUBLISH_JOB = 'cms.scheduled-publish';
export const CMS_REVIEW_DUE_JOB = 'cms.review-due';

export function registerCmsJobs(
  registry: JobRegistry,
  deps: {
    getCms: () => CmsService | null;
    resolvePermissions: (
      userId: string,
      organizationId: string,
    ) => Promise<readonly Permission[]>;
  },
) {
  registry.register({
    name: CMS_SCHEDULED_PUBLISH_JOB,
    maxAttempts: 3,
    handle: async (job: Job) => {
      const cms = deps.getCms();
      if (cms === null) {
        throw new Error('CMS services are not configured');
      }
      if (!job.actor.userId || !job.actor.organizationId) {
        throw new Error('CMS scheduled publish job requires user and organization context');
      }

      const permissions = await deps.resolvePermissions(
        job.actor.userId,
        job.actor.organizationId,
      );

      const context: AuthorizationContext = createUserContext({
        userId: asUserId(job.actor.userId),
        organizationId: asOrganizationId(job.actor.organizationId),
        permissions,
        metadata: job.actor.metadata,
      });

      await cms.runDueWorkflow(context);
    },
  });

  registry.register({
    name: CMS_REVIEW_DUE_JOB,
    maxAttempts: 3,
    handle: async (job: Job) => {
      const cms = deps.getCms();
      if (cms === null) {
        throw new Error('CMS services are not configured');
      }
      if (!job.actor.userId || !job.actor.organizationId) {
        throw new Error('CMS review-due job requires user and organization context');
      }

      const permissions = await deps.resolvePermissions(
        job.actor.userId,
        job.actor.organizationId,
      );

      const context: AuthorizationContext = createUserContext({
        userId: asUserId(job.actor.userId),
        organizationId: asOrganizationId(job.actor.organizationId),
        permissions,
        metadata: job.actor.metadata,
      });

      await cms.runDueWorkflow(context);
    },
  });
}

export function enqueueCmsScheduledPublish(
  jobs: {
    enqueue: (
      context: AuthorizationContext,
      name: string,
      payload: unknown,
    ) => Promise<unknown>;
  },
  context: AuthorizationContext,
) {
  return jobs.enqueue(context, CMS_SCHEDULED_PUBLISH_JOB, {
    requestedAt: new Date().toISOString(),
  });
}
