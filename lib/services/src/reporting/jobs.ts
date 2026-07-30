import type { JobRegistry, Job } from '@workspace/platform/jobs';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import type { Permission } from '@workspace/platform/permissions';
import type { ReportingServices } from './index.js';
import { REPORTING_KPI_REFRESH_JOB } from './kpi-engine.service.js';
import { REPORT_SCHEDULE_DELIVERY_JOB } from './report-schedule.service.js';
import { REPORTING_SUBSCRIPTION_EVAL_JOB } from './kpi-subscription.service.js';

export function registerReportingJobs(
  registry: JobRegistry,
  deps: {
    getReporting: () => ReportingServices | null;
    resolvePermissions: (
      userId: string,
      organizationId: string,
    ) => Promise<readonly Permission[]>;
  },
) {
  registry.register({
    name: REPORTING_KPI_REFRESH_JOB,
    maxAttempts: 3,
    handle: async (job: Job) => {
      const reporting = deps.getReporting();
      if (reporting === null) {
        throw new Error('Reporting services are not configured');
      }
      if (!job.actor.userId || !job.actor.organizationId) {
        throw new Error('KPI refresh job requires user and organization context');
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

      await reporting.kpiEngine.refreshSnapshots(context);
      await reporting.kpiSubscription.evaluateSubscriptions(context);
    },
  });

  registry.register({
    name: REPORT_SCHEDULE_DELIVERY_JOB,
    maxAttempts: 3,
    handle: async (job: Job) => {
      const reporting = deps.getReporting();
      if (reporting === null) {
        throw new Error('Reporting services are not configured');
      }
      if (!job.actor.userId || !job.actor.organizationId) {
        throw new Error('Schedule delivery job requires user and organization context');
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

      await reporting.reportSchedule.runDueSchedules(context);
    },
  });

  registry.register({
    name: REPORTING_SUBSCRIPTION_EVAL_JOB,
    maxAttempts: 3,
    handle: async (job: Job) => {
      const reporting = deps.getReporting();
      if (reporting === null) {
        throw new Error('Reporting services are not configured');
      }
      if (!job.actor.userId || !job.actor.organizationId) {
        throw new Error('Subscription evaluation job requires user and organization context');
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

      await reporting.kpiSubscription.evaluateSubscriptions(context);
    },
  });
}

export function enqueueKpiRefresh(
  jobs: {
    enqueue: (
      context: AuthorizationContext,
      name: string,
      payload: unknown,
    ) => Promise<unknown>;
  },
  context: AuthorizationContext,
) {
  return jobs.enqueue(context, REPORTING_KPI_REFRESH_JOB, {
    requestedAt: new Date().toISOString(),
  });
}
