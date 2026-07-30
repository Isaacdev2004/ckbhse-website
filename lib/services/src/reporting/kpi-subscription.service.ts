import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  CreateKpiSubscriptionInput,
  KpiSubscriptionSummary,
  SubscriptionEvaluationResult,
  UpdateKpiSubscriptionInput,
} from '@workspace/domain/reporting';
import { snapshotPeriodKey } from './kpi-registry.js';
import { thresholdBreached } from './trend-analysis.js';

function mapSubscription(row: {
  id: string;
  subscriptionKey: string;
  kpiKey: string;
  domain: string;
  thresholdOperator: string;
  thresholdValue: string;
  channel: string;
  enabled: boolean;
  lastTriggeredAt: Date | null;
  updatedAt: Date;
}): KpiSubscriptionSummary {
  return {
    id: row.id,
    subscriptionKey: row.subscriptionKey,
    kpiKey: row.kpiKey,
    domain: row.domain as KpiSubscriptionSummary['domain'],
    thresholdOperator: row.thresholdOperator as KpiSubscriptionSummary['thresholdOperator'],
    thresholdValue: Number(row.thresholdValue),
    channel: row.channel as KpiSubscriptionSummary['channel'],
    enabled: row.enabled,
    lastTriggeredAt: row.lastTriggeredAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class KpiSubscriptionService {
  constructor(private readonly reporting: ReportingRepository) {}

  async listSubscriptions(context: AuthorizationContext): Promise<KpiSubscriptionSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listKpiSubscriptions(context);
    return rows.map(mapSubscription);
  }

  async getSubscription(
    context: AuthorizationContext,
    subscriptionKey: string,
  ): Promise<KpiSubscriptionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getKpiSubscription(context, subscriptionKey);
    if (!row) {
      throw AppError.notFound('KPI subscription was not found');
    }
    return mapSubscription(row);
  }

  async createSubscription(
    context: AuthorizationContext,
    input: CreateKpiSubscriptionInput,
  ): Promise<KpiSubscriptionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.createKpiSubscription(context, {
      subscriptionKey: input.subscriptionKey,
      kpiKey: input.kpiKey,
      domain: input.domain,
      thresholdOperator: input.thresholdOperator,
      thresholdValue: String(input.thresholdValue),
      channel: input.channel ?? 'in_app',
      enabled: input.enabled ?? true,
    });
    if (!row) {
      throw AppError.internal('Failed to create KPI subscription');
    }
    return mapSubscription(row);
  }

  async updateSubscription(
    context: AuthorizationContext,
    subscriptionKey: string,
    input: UpdateKpiSubscriptionInput,
  ): Promise<KpiSubscriptionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.updateKpiSubscription(context, subscriptionKey, {
      ...(input.thresholdOperator !== undefined
        ? { thresholdOperator: input.thresholdOperator }
        : {}),
      ...(input.thresholdValue !== undefined
        ? { thresholdValue: String(input.thresholdValue) }
        : {}),
      ...(input.channel !== undefined ? { channel: input.channel } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    });
    if (!row) {
      throw AppError.notFound('KPI subscription was not found');
    }
    return mapSubscription(row);
  }

  async deleteSubscription(
    context: AuthorizationContext,
    subscriptionKey: string,
  ): Promise<void> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.deleteKpiSubscription(context, subscriptionKey);
    if (!row) {
      throw AppError.notFound('KPI subscription was not found');
    }
  }

  async evaluateSubscriptions(
    context: AuthorizationContext,
  ): Promise<SubscriptionEvaluationResult> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const period = snapshotPeriodKey();
    const [subscriptions, snapshots] = await Promise.all([
      this.reporting.listEnabledKpiSubscriptions(context),
      this.reporting.listKpiSnapshotsForPeriod(context, period),
    ]);

    const triggeredKeys: string[] = [];
    for (const subscription of subscriptions) {
      const snapshot = snapshots.find((row) => row.kpiKey === subscription.kpiKey);
      if (!snapshot) continue;
      const value = Number(snapshot.valueNumeric);
      const breached = thresholdBreached(
        value,
        subscription.thresholdOperator,
        Number(subscription.thresholdValue),
      );
      if (!breached) continue;
      triggeredKeys.push(subscription.subscriptionKey);
      await this.reporting.markKpiSubscriptionTriggered(context, subscription.id);
    }

    return {
      evaluated: subscriptions.length,
      triggered: triggeredKeys.length,
      triggeredKeys,
    };
  }
}

export function createKpiSubscriptionService(deps: { reporting: ReportingRepository }) {
  return new KpiSubscriptionService(deps.reporting);
}

export const REPORTING_SUBSCRIPTION_EVAL_JOB = 'reporting.subscription.evaluate';
