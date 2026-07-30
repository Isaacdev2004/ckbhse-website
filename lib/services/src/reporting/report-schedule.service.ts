import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  CreateReportScheduleInput,
  ReportExportFormat,
  ReportScheduleCadence,
  ReportScheduleSummary,
  UpdateReportScheduleInput,
} from '@workspace/domain/reporting';
import type { ReportExportService } from './report-export.service.js';

const SCHEDULE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseRecipients(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
}

function mapSchedule(row: {
  id: string;
  scheduleKey: string;
  reportKey: string;
  title: string;
  cadence: string;
  timeUtc: string;
  format: string;
  recipients: unknown;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  updatedAt: Date;
}): ReportScheduleSummary {
  return {
    id: row.id,
    scheduleKey: row.scheduleKey,
    reportKey: row.reportKey,
    title: row.title,
    cadence: row.cadence as ReportScheduleCadence,
    timeUtc: row.timeUtc,
    format: row.format as ReportExportFormat,
    recipients: parseRecipients(row.recipients),
    enabled: row.enabled,
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    nextRunAt: row.nextRunAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function computeNextRunAt(
  cadence: ReportScheduleCadence,
  timeUtc: string,
  from = new Date(),
): Date {
  const [hourText, minuteText] = timeUtc.split(':');
  const hour = Number(hourText ?? 8);
  const minute = Number(minuteText ?? 0);
  const next = new Date(from);

  if (cadence === 'daily') {
    next.setUTCHours(hour, minute, 0, 0);
    if (next <= from) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next;
  }

  if (cadence === 'weekly') {
    next.setUTCDate(next.getUTCDate() + 7);
    next.setUTCHours(hour, minute, 0, 0);
    return next;
  }

  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCHours(hour, minute, 0, 0);
  return next;
}

export class ReportScheduleService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly reportExport: ReportExportService,
  ) {}

  async listSchedules(context: AuthorizationContext): Promise<ReportScheduleSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listSchedules(context);
    return rows.map(mapSchedule);
  }

  async getSchedule(
    context: AuthorizationContext,
    scheduleKey: string,
  ): Promise<ReportScheduleSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getSchedule(context, scheduleKey);
    if (!row) {
      throw AppError.notFound(`Schedule "${scheduleKey}" was not found`);
    }
    return mapSchedule(row);
  }

  async createSchedule(
    context: AuthorizationContext,
    input: CreateReportScheduleInput,
  ): Promise<ReportScheduleSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    if (!SCHEDULE_KEY_PATTERN.test(input.scheduleKey)) {
      throw AppError.badRequest(
        'Schedule key must be lowercase alphanumeric segments separated by hyphens',
      );
    }

    const existing = await this.reporting.getSchedule(context, input.scheduleKey);
    if (existing) {
      throw AppError.conflict(`Schedule "${input.scheduleKey}" already exists`);
    }

    const nextRunAt = computeNextRunAt(input.cadence, input.timeUtc);
    const row = await this.reporting.createSchedule(context, {
      scheduleKey: input.scheduleKey,
      reportKey: input.reportKey,
      title: input.title,
      cadence: input.cadence,
      timeUtc: input.timeUtc,
      format: input.format,
      recipients: [...(input.recipients ?? [])],
      enabled: input.enabled ?? true,
      nextRunAt,
    });
    if (!row) {
      throw AppError.internal('Failed to create schedule');
    }
    return mapSchedule(row);
  }

  async updateSchedule(
    context: AuthorizationContext,
    scheduleKey: string,
    input: UpdateReportScheduleInput,
  ): Promise<ReportScheduleSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const existing = await this.reporting.getSchedule(context, scheduleKey);
    if (!existing) {
      throw AppError.notFound(`Schedule "${scheduleKey}" was not found`);
    }

    const cadence = (input.cadence ?? existing.cadence) as ReportScheduleCadence;
    const timeUtc = input.timeUtc ?? existing.timeUtc;
    const nextRunAt =
      input.cadence !== undefined || input.timeUtc !== undefined
        ? computeNextRunAt(cadence, timeUtc)
        : existing.nextRunAt ?? computeNextRunAt(cadence, timeUtc);

    const row = await this.reporting.updateSchedule(context, scheduleKey, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.cadence !== undefined ? { cadence: input.cadence } : {}),
      ...(input.timeUtc !== undefined ? { timeUtc: input.timeUtc } : {}),
      ...(input.format !== undefined ? { format: input.format } : {}),
      ...(input.recipients !== undefined ? { recipients: [...input.recipients] } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      nextRunAt,
    });
    if (!row) {
      throw AppError.notFound(`Schedule "${scheduleKey}" was not found`);
    }
    return mapSchedule(row);
  }

  async deleteSchedule(context: AuthorizationContext, scheduleKey: string): Promise<void> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.deleteSchedule(context, scheduleKey);
    if (!row) {
      throw AppError.notFound(`Schedule "${scheduleKey}" was not found`);
    }
  }

  async runDueSchedules(context: AuthorizationContext, asOf = new Date()) {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const due = await this.reporting.listDueSchedules(context, asOf);
    const results: Array<{ scheduleKey: string; exportJobId: string }> = [];

    for (const schedule of due) {
      const exportJob = await this.reportExport.createExport(
        context,
        schedule.reportKey,
        schedule.format as ReportExportFormat,
      );
      await this.reporting.updateSchedule(context, schedule.scheduleKey, {
        lastRunAt: asOf,
        nextRunAt: computeNextRunAt(
          schedule.cadence as ReportScheduleCadence,
          schedule.timeUtc,
          asOf,
        ),
      });
      results.push({ scheduleKey: schedule.scheduleKey, exportJobId: exportJob.id });
    }

    return { processed: results.length, results };
  }
}

export function createReportScheduleService(deps: {
  reporting: ReportingRepository;
  reportExport: ReportExportService;
}) {
  return new ReportScheduleService(deps.reporting, deps.reportExport);
}

export const REPORT_SCHEDULE_DELIVERY_JOB = 'reporting.schedule.deliver';
