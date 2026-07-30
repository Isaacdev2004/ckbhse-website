import type { ReportingRepository } from '@workspace/data/repositories/reporting';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import {
  buildTenantKey,
  type StorageProvider,
} from '@workspace/platform/storage';
import type {
  ReportExportDownload,
  ReportExportFormat,
  ReportExportJobSummary,
} from '@workspace/domain/reporting';
import type { ReportBuilderService } from './report-builder.service.js';
import { formatReportExport } from './report-export.formatters.js';
import { assertExportWithinLimit } from './reporting-limits.js';

const SIGNED_URL_TTL = 900;

function mapExportJob(row: {
  id: string;
  reportKey: string;
  format: string;
  status: string;
  fileKey: string | null;
  errorMessage: string | null;
  completedAt: Date | null;
  createdAt: Date;
}): ReportExportJobSummary {
  return {
    id: row.id,
    reportKey: row.reportKey,
    format: row.format as ReportExportFormat,
    status: row.status as ReportExportJobSummary['status'],
    fileKey: row.fileKey,
    errorMessage: row.errorMessage,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ReportExportService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly reportBuilder: ReportBuilderService,
    private readonly storage: StorageProvider,
  ) {}

  async listExports(context: AuthorizationContext): Promise<ReportExportJobSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listExportJobs(context);
    return rows.map(mapExportJob);
  }

  async createExport(
    context: AuthorizationContext,
    reportKey: string,
    format: ReportExportFormat = 'csv',
  ): Promise<ReportExportJobSummary> {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    if (!context.organizationId) {
      throw AppError.forbidden('Organization context is required');
    }

    const job = await this.reporting.createExportJob(context, {
      reportKey,
      format,
      status: 'processing',
    });
    if (!job) {
      throw AppError.internal('Failed to create export job');
    }

    try {
      const execution = await this.reportBuilder.runReport(context, reportKey);
      assertExportWithinLimit(execution.rowCount);
      const rendered = formatReportExport(execution, format);
      const fileKey = buildTenantKey(
        context.organizationId,
        'reporting',
        'exports',
        `${job.id}.${rendered.extension}`,
      );

      await this.storage.put({
        key: fileKey,
        body: rendered.body,
        contentType: rendered.contentType,
      });

      const completed = await this.reporting.updateExportJob(context, job.id, {
        status: 'ready',
        fileKey,
        completedAt: new Date(),
      });
      if (!completed) {
        throw AppError.internal('Failed to complete export job');
      }
      return mapExportJob(completed);
    } catch (error) {
      await this.reporting.updateExportJob(context, job.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Export failed',
        completedAt: new Date(),
      });
      throw error;
    }
  }

  async getExport(
    context: AuthorizationContext,
    jobId: string,
  ): Promise<ReportExportJobSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getExportJob(context, jobId);
    if (!row) {
      throw AppError.notFound('Export job was not found');
    }
    return mapExportJob(row);
  }

  async getDownloadUrl(
    context: AuthorizationContext,
    jobId: string,
  ): Promise<ReportExportDownload> {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    const row = await this.reporting.getExportJob(context, jobId);
    if (!row) {
      throw AppError.notFound('Export job was not found');
    }
    if (row.status !== 'ready' || !row.fileKey) {
      throw AppError.conflict('Export is not ready for download');
    }

    const metadata = await this.storage.head(row.fileKey);
    const extension = row.format === 'pdf' ? 'pdf' : row.format === 'xlsx' ? 'xlsx' : 'csv';
    const filename = `${row.reportKey}.${extension}`;

    return {
      jobId: row.id,
      downloadUrl: await this.storage.signedReadUrl({
        key: row.fileKey,
        expiresInSeconds: SIGNED_URL_TTL,
        downloadFilename: filename,
      }),
      expiresInSeconds: SIGNED_URL_TTL,
      contentType: metadata?.contentType ?? 'application/octet-stream',
      filename,
    };
  }
}

export function createReportExportService(deps: {
  reporting: ReportingRepository;
  reportBuilder: ReportBuilderService;
  storage: StorageProvider;
}) {
  return new ReportExportService(deps.reporting, deps.reportBuilder, deps.storage);
}
