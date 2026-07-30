import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleReportingStore } from '../stores/drizzle-reporting.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (!context.organizationId) {
    throw AppError.forbidden('Organization context is required');
  }
  return context.organizationId;
}

function requireUserId(context: AuthorizationContext): string {
  if (!context.userId) {
    throw AppError.forbidden('User context is required');
  }
  return context.userId;
}

export class ReportingRepository {
  constructor(private readonly store: DrizzleReportingStore) {}

  listKpiSnapshots(context: AuthorizationContext, limit?: number) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listKpiSnapshots(requireOrganizationId(context), limit);
  }

  listKpiSnapshotsForPeriod(context: AuthorizationContext, snapshotPeriod: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listKpiSnapshotsForPeriod(
      requireOrganizationId(context),
      snapshotPeriod,
    );
  }

  upsertKpiSnapshot(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['upsertKpiSnapshot']>[0],
      'organizationId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.upsertKpiSnapshot({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  listViewRegistry(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listViewRegistry();
  }

  touchViewRegistry(
    context: AuthorizationContext,
    viewKey: string,
    input: Parameters<DrizzleReportingStore['touchViewRegistry']>[1],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.touchViewRegistry(viewKey, input);
  }

  listReportDefinitions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listReportDefinitions(requireOrganizationId(context));
  }

  getReportDefinition(context: AuthorizationContext, reportKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getReportDefinition(
      requireOrganizationId(context),
      reportKey,
    );
  }

  createReportDefinition(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createReportDefinition']>[0],
      'organizationId' | 'createdBy'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.createReportDefinition({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
    });
  }

  updateReportDefinition(
    context: AuthorizationContext,
    reportKey: string,
    input: Parameters<DrizzleReportingStore['updateReportDefinition']>[2],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.updateReportDefinition(
      requireOrganizationId(context),
      reportKey,
      input,
    );
  }

  deleteReportDefinition(context: AuthorizationContext, reportKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.deleteReportDefinition(
      requireOrganizationId(context),
      reportKey,
    );
  }

  listExportJobs(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listExportJobs(requireOrganizationId(context));
  }

  getExportJob(context: AuthorizationContext, jobId: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getExportJob(requireOrganizationId(context), jobId);
  }

  createExportJob(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createExportJob']>[0],
      'organizationId' | 'requestedBy'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    return this.store.createExportJob({
      ...input,
      organizationId: requireOrganizationId(context),
      requestedBy: context.userId ?? null,
    });
  }

  updateExportJob(
    context: AuthorizationContext,
    jobId: string,
    input: Parameters<DrizzleReportingStore['updateExportJob']>[2],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    return this.store.updateExportJob(
      requireOrganizationId(context),
      jobId,
      input,
    );
  }

  listSchedules(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listSchedules(requireOrganizationId(context));
  }

  listDueSchedules(context: AuthorizationContext, asOf: Date) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.listDueSchedules(asOf);
  }

  getSchedule(context: AuthorizationContext, scheduleKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getSchedule(requireOrganizationId(context), scheduleKey);
  }

  createSchedule(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createSchedule']>[0],
      'organizationId' | 'createdBy'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.createSchedule({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
    });
  }

  updateSchedule(
    context: AuthorizationContext,
    scheduleKey: string,
    input: Parameters<DrizzleReportingStore['updateSchedule']>[2],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.updateSchedule(
      requireOrganizationId(context),
      scheduleKey,
      input,
    );
  }

  deleteSchedule(context: AuthorizationContext, scheduleKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.deleteSchedule(requireOrganizationId(context), scheduleKey);
  }

  listDashboardDefinitions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listDashboardDefinitions(requireOrganizationId(context));
  }

  getDashboardDefinition(context: AuthorizationContext, dashboardKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getDashboardDefinition(
      requireOrganizationId(context),
      dashboardKey,
    );
  }

  listDashboardWidgets(context: AuthorizationContext, dashboardId: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listDashboardWidgets(dashboardId);
  }

  getUserDashboardLayout(context: AuthorizationContext, dashboardKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getUserDashboardLayout(
      requireOrganizationId(context),
      requireUserId(context),
      dashboardKey,
    );
  }

  saveUserDashboardLayout(
    context: AuthorizationContext,
    dashboardKey: string,
    layout: unknown[],
  ) {
    requirePermission(context, PERMISSIONS.DASHBOARD_PERSONALIZE);
    return this.store.upsertUserDashboardLayout({
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
      dashboardKey,
      layout,
    });
  }

  listKpiSnapshotHistory(context: AuthorizationContext, kpiKey: string, limit?: number) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listKpiSnapshotHistory(
      requireOrganizationId(context),
      kpiKey,
      limit,
    );
  }

  listBiConnections(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listBiConnections(requireOrganizationId(context));
  }

  getBiConnection(context: AuthorizationContext, connectionKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getBiConnection(requireOrganizationId(context), connectionKey);
  }

  createBiConnection(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createBiConnection']>[0],
      'organizationId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.createBiConnection({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  updateBiConnection(
    context: AuthorizationContext,
    connectionKey: string,
    input: Parameters<DrizzleReportingStore['updateBiConnection']>[2],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.updateBiConnection(
      requireOrganizationId(context),
      connectionKey,
      input,
    );
  }

  listBiExports(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listBiExports(requireOrganizationId(context));
  }

  getBiExport(context: AuthorizationContext, exportId: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getBiExport(requireOrganizationId(context), exportId);
  }

  getLatestBiExport(context: AuthorizationContext, connectionKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getLatestBiExport(requireOrganizationId(context), connectionKey);
  }

  createBiExport(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createBiExport']>[0],
      'organizationId' | 'requestedBy'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    return this.store.createBiExport({
      ...input,
      organizationId: requireOrganizationId(context),
      requestedBy: context.userId ?? null,
    });
  }

  updateBiExport(
    context: AuthorizationContext,
    exportId: string,
    input: Parameters<DrizzleReportingStore['updateBiExport']>[2],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    return this.store.updateBiExport(
      requireOrganizationId(context),
      exportId,
      input,
    );
  }

  listBenchmarkCohorts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listBenchmarkCohorts();
  }

  listBenchmarkMetrics(
    context: AuthorizationContext,
    cohortKey: string,
    snapshotPeriod?: string,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listBenchmarkMetrics(cohortKey, snapshotPeriod);
  }

  listForecasts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listForecasts(requireOrganizationId(context));
  }

  getForecast(context: AuthorizationContext, kpiKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.getForecast(requireOrganizationId(context), kpiKey);
  }

  upsertForecast(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['upsertForecast']>[0],
      'organizationId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.upsertForecast({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  listKpiSubscriptions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    return this.store.listKpiSubscriptions(
      requireOrganizationId(context),
      context.userId ?? undefined,
    );
  }

  getKpiSubscription(context: AuthorizationContext, subscriptionKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    if (!context.userId) {
      throw AppError.forbidden('User context is required');
    }
    return this.store.getKpiSubscription(
      requireOrganizationId(context),
      context.userId,
      subscriptionKey,
    );
  }

  createKpiSubscription(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzleReportingStore['createKpiSubscription']>[0],
      'organizationId' | 'userId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.createKpiSubscription({
      ...input,
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
    });
  }

  updateKpiSubscription(
    context: AuthorizationContext,
    subscriptionKey: string,
    input: Parameters<DrizzleReportingStore['updateKpiSubscription']>[3],
  ) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.updateKpiSubscription(
      requireOrganizationId(context),
      requireUserId(context),
      subscriptionKey,
      input,
    );
  }

  deleteKpiSubscription(context: AuthorizationContext, subscriptionKey: string) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.deleteKpiSubscription(
      requireOrganizationId(context),
      requireUserId(context),
      subscriptionKey,
    );
  }

  listEnabledKpiSubscriptions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.listEnabledKpiSubscriptions(requireOrganizationId(context));
  }

  markKpiSubscriptionTriggered(context: AuthorizationContext, subscriptionId: string) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    return this.store.markKpiSubscriptionTriggered(
      requireOrganizationId(context),
      subscriptionId,
    );
  }
}
