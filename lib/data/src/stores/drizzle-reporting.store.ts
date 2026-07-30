import {
  dashboardDefinitions,
  dashboardWidgets,
  reportDefinitions,
  reportExportJobs,
  reportSchedules,
  reportingBenchmarkCohorts,
  reportingBenchmarkMetrics,
  reportingBiConnections,
  reportingBiExports,
  reportingForecasts,
  reportingKpiSnapshots,
  reportingKpiSubscriptions,
  reportingViewRegistry,
  userDashboardLayouts,
} from '@workspace/db/schema';
import type { Database } from '@workspace/db';
import { and, asc, desc, eq, isNull, lte, or } from 'drizzle-orm';

export class DrizzleReportingStore {
  constructor(private readonly db: Database) {}

  listKpiSnapshots(organizationId: string, limit = 200) {
    return this.db
      .select()
      .from(reportingKpiSnapshots)
      .where(eq(reportingKpiSnapshots.organizationId, organizationId))
      .orderBy(
        desc(reportingKpiSnapshots.snapshotPeriod),
        reportingKpiSnapshots.domain,
        reportingKpiSnapshots.kpiKey,
      )
      .limit(limit);
  }

  listKpiSnapshotsForPeriod(organizationId: string, snapshotPeriod: string) {
    return this.db
      .select()
      .from(reportingKpiSnapshots)
      .where(
        and(
          eq(reportingKpiSnapshots.organizationId, organizationId),
          eq(reportingKpiSnapshots.snapshotPeriod, snapshotPeriod),
        ),
      )
      .orderBy(reportingKpiSnapshots.domain, reportingKpiSnapshots.kpiKey);
  }

  listKpiSnapshotHistory(organizationId: string, kpiKey: string, limit = 12) {
    return this.db
      .select()
      .from(reportingKpiSnapshots)
      .where(
        and(
          eq(reportingKpiSnapshots.organizationId, organizationId),
          eq(reportingKpiSnapshots.kpiKey, kpiKey),
        ),
      )
      .orderBy(desc(reportingKpiSnapshots.snapshotPeriod))
      .limit(limit);
  }

  async upsertKpiSnapshot(input: {
    organizationId: string;
    snapshotPeriod: string;
    domain: (typeof reportingKpiSnapshots.$inferInsert)['domain'];
    kpiKey: string;
    label: string;
    valueNumeric: string;
    unit: (typeof reportingKpiSnapshots.$inferInsert)['unit'];
    metadata?: Record<string, unknown>;
  }) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportingKpiSnapshots)
      .values({
        organizationId: input.organizationId,
        snapshotPeriod: input.snapshotPeriod,
        domain: input.domain,
        kpiKey: input.kpiKey,
        label: input.label,
        valueNumeric: input.valueNumeric,
        unit: input.unit,
        metadata: input.metadata ?? {},
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          reportingKpiSnapshots.organizationId,
          reportingKpiSnapshots.snapshotPeriod,
          reportingKpiSnapshots.domain,
          reportingKpiSnapshots.kpiKey,
        ],
        set: {
          label: input.label,
          valueNumeric: input.valueNumeric,
          unit: input.unit,
          metadata: input.metadata ?? {},
          updatedAt: now,
        },
      })
      .returning();
    return row ?? null;
  }

  listViewRegistry() {
    return this.db.select().from(reportingViewRegistry).orderBy(reportingViewRegistry.viewKey);
  }

  async touchViewRegistry(
    viewKey: string,
    input: {
      refreshStatus: (typeof reportingViewRegistry.$inferInsert)['refreshStatus'];
      rowCount?: number;
      metadata?: Record<string, unknown>;
    },
  ) {
    const now = new Date();
    const [row] = await this.db
      .update(reportingViewRegistry)
      .set({
        refreshStatus: input.refreshStatus,
        lastRefreshedAt: input.refreshStatus === 'idle' ? now : undefined,
        rowCount: input.rowCount ?? undefined,
        metadata: input.metadata ?? undefined,
        updatedAt: now,
      })
      .where(eq(reportingViewRegistry.viewKey, viewKey))
      .returning();
    return row ?? null;
  }

  listReportDefinitions(organizationId: string) {
    return this.db
      .select()
      .from(reportDefinitions)
      .where(eq(reportDefinitions.organizationId, organizationId))
      .orderBy(reportDefinitions.title);
  }

  getReportDefinition(organizationId: string, reportKey: string) {
    return this.db
      .select()
      .from(reportDefinitions)
      .where(
        and(
          eq(reportDefinitions.organizationId, organizationId),
          eq(reportDefinitions.reportKey, reportKey),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createReportDefinition(input: {
    organizationId: string;
    reportKey: string;
    title: string;
    domain: (typeof reportDefinitions.$inferInsert)['domain'];
    definition: Record<string, unknown>;
    createdBy?: string | null;
  }) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportDefinitions)
      .values({
        organizationId: input.organizationId,
        reportKey: input.reportKey,
        title: input.title,
        domain: input.domain,
        definition: input.definition,
        createdBy: input.createdBy ?? null,
        updatedAt: now,
      })
      .returning();
    return row ?? null;
  }

  async updateReportDefinition(
    organizationId: string,
    reportKey: string,
    input: {
      title?: string;
      domain?: (typeof reportDefinitions.$inferInsert)['domain'];
      definition?: Record<string, unknown>;
    },
  ) {
    const now = new Date();
    const [row] = await this.db
      .update(reportDefinitions)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.domain !== undefined ? { domain: input.domain } : {}),
        ...(input.definition !== undefined ? { definition: input.definition } : {}),
        updatedAt: now,
      })
      .where(
        and(
          eq(reportDefinitions.organizationId, organizationId),
          eq(reportDefinitions.reportKey, reportKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  async deleteReportDefinition(organizationId: string, reportKey: string) {
    const [row] = await this.db
      .delete(reportDefinitions)
      .where(
        and(
          eq(reportDefinitions.organizationId, organizationId),
          eq(reportDefinitions.reportKey, reportKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  listExportJobs(organizationId: string, limit = 20) {
    return this.db
      .select()
      .from(reportExportJobs)
      .where(eq(reportExportJobs.organizationId, organizationId))
      .orderBy(desc(reportExportJobs.createdAt))
      .limit(limit);
  }

  getExportJob(organizationId: string, jobId: string) {
    return this.db
      .select()
      .from(reportExportJobs)
      .where(
        and(
          eq(reportExportJobs.organizationId, organizationId),
          eq(reportExportJobs.id, jobId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createExportJob(input: typeof reportExportJobs.$inferInsert) {
    const [row] = await this.db.insert(reportExportJobs).values(input).returning();
    return row ?? null;
  }

  async updateExportJob(
    organizationId: string,
    jobId: string,
    input: Partial<typeof reportExportJobs.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(reportExportJobs)
      .set(input)
      .where(
        and(
          eq(reportExportJobs.organizationId, organizationId),
          eq(reportExportJobs.id, jobId),
        ),
      )
      .returning();
    return row ?? null;
  }

  listSchedules(organizationId: string) {
    return this.db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.organizationId, organizationId))
      .orderBy(reportSchedules.title);
  }

  listDueSchedules(asOf: Date) {
    return this.db
      .select()
      .from(reportSchedules)
      .where(
        and(eq(reportSchedules.enabled, true), lte(reportSchedules.nextRunAt, asOf)),
      )
      .orderBy(asc(reportSchedules.nextRunAt));
  }

  getSchedule(organizationId: string, scheduleKey: string) {
    return this.db
      .select()
      .from(reportSchedules)
      .where(
        and(
          eq(reportSchedules.organizationId, organizationId),
          eq(reportSchedules.scheduleKey, scheduleKey),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createSchedule(input: typeof reportSchedules.$inferInsert) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportSchedules)
      .values({ ...input, updatedAt: now })
      .returning();
    return row ?? null;
  }

  async updateSchedule(
    organizationId: string,
    scheduleKey: string,
    input: Partial<typeof reportSchedules.$inferInsert>,
  ) {
    const now = new Date();
    const [row] = await this.db
      .update(reportSchedules)
      .set({ ...input, updatedAt: now })
      .where(
        and(
          eq(reportSchedules.organizationId, organizationId),
          eq(reportSchedules.scheduleKey, scheduleKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  async deleteSchedule(organizationId: string, scheduleKey: string) {
    const [row] = await this.db
      .delete(reportSchedules)
      .where(
        and(
          eq(reportSchedules.organizationId, organizationId),
          eq(reportSchedules.scheduleKey, scheduleKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  listDashboardDefinitions(organizationId: string) {
    return this.db
      .select()
      .from(dashboardDefinitions)
      .where(
        or(
          isNull(dashboardDefinitions.organizationId),
          eq(dashboardDefinitions.organizationId, organizationId),
        ),
      )
      .orderBy(desc(dashboardDefinitions.isDefault), dashboardDefinitions.title);
  }

  getDashboardDefinition(organizationId: string, dashboardKey: string) {
    return this.db
      .select()
      .from(dashboardDefinitions)
      .where(
        and(
          eq(dashboardDefinitions.dashboardKey, dashboardKey),
          or(
            isNull(dashboardDefinitions.organizationId),
            eq(dashboardDefinitions.organizationId, organizationId),
          ),
        ),
      )
      .then(async (rows) => {
        const orgSpecific = rows.find((row) => row.organizationId === organizationId);
        if (orgSpecific) return orgSpecific;
        return rows.find((row) => row.organizationId === null) ?? null;
      });
  }

  listDashboardWidgets(dashboardId: string) {
    return this.db
      .select()
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.dashboardId, dashboardId))
      .orderBy(asc(dashboardWidgets.defaultOrder), dashboardWidgets.widgetKey);
  }

  getUserDashboardLayout(
    organizationId: string,
    userId: string,
    dashboardKey: string,
  ) {
    return this.db
      .select()
      .from(userDashboardLayouts)
      .where(
        and(
          eq(userDashboardLayouts.organizationId, organizationId),
          eq(userDashboardLayouts.userId, userId),
          eq(userDashboardLayouts.dashboardKey, dashboardKey),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async upsertUserDashboardLayout(input: {
    organizationId: string;
    userId: string;
    dashboardKey: string;
    layout: unknown[];
  }) {
    const now = new Date();
    const [row] = await this.db
      .insert(userDashboardLayouts)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        dashboardKey: input.dashboardKey,
        layout: input.layout,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          userDashboardLayouts.organizationId,
          userDashboardLayouts.userId,
          userDashboardLayouts.dashboardKey,
        ],
        set: {
          layout: input.layout,
          updatedAt: now,
        },
      })
      .returning();
    return row ?? null;
  }

  listBiConnections(organizationId: string) {
    return this.db
      .select()
      .from(reportingBiConnections)
      .where(eq(reportingBiConnections.organizationId, organizationId))
      .orderBy(reportingBiConnections.connectionKey);
  }

  getBiConnection(organizationId: string, connectionKey: string) {
    return this.db
      .select()
      .from(reportingBiConnections)
      .where(
        and(
          eq(reportingBiConnections.organizationId, organizationId),
          eq(reportingBiConnections.connectionKey, connectionKey),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createBiConnection(input: typeof reportingBiConnections.$inferInsert) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportingBiConnections)
      .values({ ...input, updatedAt: now })
      .returning();
    return row ?? null;
  }

  async updateBiConnection(
    organizationId: string,
    connectionKey: string,
    input: Partial<typeof reportingBiConnections.$inferInsert>,
  ) {
    const now = new Date();
    const [row] = await this.db
      .update(reportingBiConnections)
      .set({ ...input, updatedAt: now })
      .where(
        and(
          eq(reportingBiConnections.organizationId, organizationId),
          eq(reportingBiConnections.connectionKey, connectionKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  listBiExports(organizationId: string) {
    return this.db
      .select()
      .from(reportingBiExports)
      .where(eq(reportingBiExports.organizationId, organizationId))
      .orderBy(desc(reportingBiExports.createdAt));
  }

  getBiExport(organizationId: string, exportId: string) {
    return this.db
      .select()
      .from(reportingBiExports)
      .where(
        and(
          eq(reportingBiExports.organizationId, organizationId),
          eq(reportingBiExports.id, exportId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  getLatestBiExport(organizationId: string, connectionKey: string) {
    return this.db
      .select()
      .from(reportingBiExports)
      .where(
        and(
          eq(reportingBiExports.organizationId, organizationId),
          eq(reportingBiExports.connectionKey, connectionKey),
          eq(reportingBiExports.status, 'ready'),
        ),
      )
      .orderBy(desc(reportingBiExports.completedAt))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createBiExport(input: typeof reportingBiExports.$inferInsert) {
    const [row] = await this.db.insert(reportingBiExports).values(input).returning();
    return row ?? null;
  }

  async updateBiExport(
    organizationId: string,
    exportId: string,
    input: Partial<typeof reportingBiExports.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(reportingBiExports)
      .set(input)
      .where(
        and(
          eq(reportingBiExports.organizationId, organizationId),
          eq(reportingBiExports.id, exportId),
        ),
      )
      .returning();
    return row ?? null;
  }

  listBenchmarkCohorts() {
    return this.db
      .select()
      .from(reportingBenchmarkCohorts)
      .orderBy(reportingBenchmarkCohorts.label);
  }

  listBenchmarkMetrics(cohortKey: string, snapshotPeriod?: string) {
    const conditions = [eq(reportingBenchmarkMetrics.cohortKey, cohortKey)];
    if (snapshotPeriod) {
      conditions.push(eq(reportingBenchmarkMetrics.snapshotPeriod, snapshotPeriod));
    }
    return this.db
      .select()
      .from(reportingBenchmarkMetrics)
      .where(and(...conditions))
      .orderBy(reportingBenchmarkMetrics.domain, reportingBenchmarkMetrics.kpiKey);
  }

  listForecasts(organizationId: string) {
    return this.db
      .select()
      .from(reportingForecasts)
      .where(eq(reportingForecasts.organizationId, organizationId))
      .orderBy(reportingForecasts.kpiKey, desc(reportingForecasts.forecastPeriod));
  }

  getForecast(organizationId: string, kpiKey: string) {
    return this.db
      .select()
      .from(reportingForecasts)
      .where(
        and(
          eq(reportingForecasts.organizationId, organizationId),
          eq(reportingForecasts.kpiKey, kpiKey),
        ),
      )
      .orderBy(desc(reportingForecasts.forecastPeriod))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async upsertForecast(input: typeof reportingForecasts.$inferInsert) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportingForecasts)
      .values({ ...input, updatedAt: now })
      .onConflictDoUpdate({
        target: [
          reportingForecasts.organizationId,
          reportingForecasts.kpiKey,
          reportingForecasts.forecastPeriod,
        ],
        set: {
          snapshotPeriod: input.snapshotPeriod,
          domain: input.domain,
          projectedValue: input.projectedValue,
          confidence: input.confidence,
          method: input.method,
          riskOfBreach: input.riskOfBreach,
          metadata: input.metadata ?? {},
          updatedAt: now,
        },
      })
      .returning();
    return row ?? null;
  }

  listKpiSubscriptions(organizationId: string, userId?: string) {
    const conditions = [eq(reportingKpiSubscriptions.organizationId, organizationId)];
    if (userId) {
      conditions.push(eq(reportingKpiSubscriptions.userId, userId));
    }
    return this.db
      .select()
      .from(reportingKpiSubscriptions)
      .where(and(...conditions))
      .orderBy(reportingKpiSubscriptions.subscriptionKey);
  }

  getKpiSubscription(organizationId: string, userId: string, subscriptionKey: string) {
    return this.db
      .select()
      .from(reportingKpiSubscriptions)
      .where(
        and(
          eq(reportingKpiSubscriptions.organizationId, organizationId),
          eq(reportingKpiSubscriptions.userId, userId),
          eq(reportingKpiSubscriptions.subscriptionKey, subscriptionKey),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  async createKpiSubscription(input: typeof reportingKpiSubscriptions.$inferInsert) {
    const now = new Date();
    const [row] = await this.db
      .insert(reportingKpiSubscriptions)
      .values({ ...input, updatedAt: now })
      .returning();
    return row ?? null;
  }

  async updateKpiSubscription(
    organizationId: string,
    userId: string,
    subscriptionKey: string,
    input: Partial<typeof reportingKpiSubscriptions.$inferInsert>,
  ) {
    const now = new Date();
    const [row] = await this.db
      .update(reportingKpiSubscriptions)
      .set({ ...input, updatedAt: now })
      .where(
        and(
          eq(reportingKpiSubscriptions.organizationId, organizationId),
          eq(reportingKpiSubscriptions.userId, userId),
          eq(reportingKpiSubscriptions.subscriptionKey, subscriptionKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  async deleteKpiSubscription(
    organizationId: string,
    userId: string,
    subscriptionKey: string,
  ) {
    const [row] = await this.db
      .delete(reportingKpiSubscriptions)
      .where(
        and(
          eq(reportingKpiSubscriptions.organizationId, organizationId),
          eq(reportingKpiSubscriptions.userId, userId),
          eq(reportingKpiSubscriptions.subscriptionKey, subscriptionKey),
        ),
      )
      .returning();
    return row ?? null;
  }

  listEnabledKpiSubscriptions(organizationId: string) {
    return this.db
      .select()
      .from(reportingKpiSubscriptions)
      .where(
        and(
          eq(reportingKpiSubscriptions.organizationId, organizationId),
          eq(reportingKpiSubscriptions.enabled, true),
        ),
      );
  }

  async markKpiSubscriptionTriggered(organizationId: string, subscriptionId: string) {
    const now = new Date();
    const [row] = await this.db
      .update(reportingKpiSubscriptions)
      .set({ lastTriggeredAt: now, updatedAt: now })
      .where(
        and(
          eq(reportingKpiSubscriptions.organizationId, organizationId),
          eq(reportingKpiSubscriptions.id, subscriptionId),
        ),
      )
      .returning();
    return row ?? null;
  }
}
