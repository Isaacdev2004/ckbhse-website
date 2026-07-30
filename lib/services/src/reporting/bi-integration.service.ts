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
  BiConnectionSummary,
  BiExportDownload,
  BiExportJobSummary,
  BiExportType,
  BiIncrementalManifest,
  CreateBiConnectionInput,
  UpdateBiConnectionInput,
} from '@workspace/domain/reporting';
import {
  buildIncrementalManifest,
  buildPowerBiDataset,
  serializePowerBiDataset,
} from '@workspace/integrations-power-bi';
import type { ReportingService } from './reporting.service.js';
import { snapshotPeriodKey } from './kpi-registry.js';
import { assertExportWithinLimit, MAX_BI_EXPORT_ROWS } from './reporting-limits.js';

const SIGNED_URL_TTL = 900;

function mapConnection(row: {
  id: string;
  connectionKey: string;
  provider: string;
  workspaceId: string;
  datasetName: string;
  datasetKey: string;
  enabled: boolean;
  lastSyncAt: Date | null;
  updatedAt: Date;
}): BiConnectionSummary {
  return {
    id: row.id,
    connectionKey: row.connectionKey,
    provider: row.provider,
    workspaceId: row.workspaceId,
    datasetName: row.datasetName,
    datasetKey: row.datasetKey,
    enabled: row.enabled,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapExport(row: {
  id: string;
  connectionKey: string;
  datasetKey: string;
  exportType: string;
  status: string;
  fileKey: string | null;
  rowCount: number;
  watermark: unknown;
  errorMessage: string | null;
  completedAt: Date | null;
  createdAt: Date;
}): BiExportJobSummary {
  return {
    id: row.id,
    connectionKey: row.connectionKey,
    datasetKey: row.datasetKey,
    exportType: row.exportType as BiExportType,
    status: row.status as BiExportJobSummary['status'],
    fileKey: row.fileKey,
    rowCount: row.rowCount,
    watermark: (row.watermark as Record<string, unknown>) ?? {},
    errorMessage: row.errorMessage,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class BiIntegrationService {
  constructor(
    private readonly reporting: ReportingRepository,
    private readonly reportingService: ReportingService,
    private readonly storage: StorageProvider,
  ) {}

  async listConnections(context: AuthorizationContext): Promise<BiConnectionSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listBiConnections(context);
    return rows.map(mapConnection);
  }

  async getConnection(
    context: AuthorizationContext,
    connectionKey: string,
  ): Promise<BiConnectionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getBiConnection(context, connectionKey);
    if (!row) {
      throw AppError.notFound('BI connection was not found');
    }
    return mapConnection(row);
  }

  async createConnection(
    context: AuthorizationContext,
    input: CreateBiConnectionInput,
  ): Promise<BiConnectionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.createBiConnection(context, {
      connectionKey: input.connectionKey,
      provider: 'power_bi',
      workspaceId: input.workspaceId,
      datasetName: input.datasetName,
      datasetKey: input.datasetKey,
      enabled: input.enabled ?? true,
      metadata: input.metadata ?? {},
    });
    if (!row) {
      throw AppError.internal('Failed to create BI connection');
    }
    return mapConnection(row);
  }

  async updateConnection(
    context: AuthorizationContext,
    connectionKey: string,
    input: UpdateBiConnectionInput,
  ): Promise<BiConnectionSummary> {
    requirePermission(context, PERMISSIONS.REPORT_MANAGE);
    const row = await this.reporting.updateBiConnection(context, connectionKey, {
      ...(input.workspaceId !== undefined ? { workspaceId: input.workspaceId } : {}),
      ...(input.datasetName !== undefined ? { datasetName: input.datasetName } : {}),
      ...(input.datasetKey !== undefined ? { datasetKey: input.datasetKey } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    });
    if (!row) {
      throw AppError.notFound('BI connection was not found');
    }
    return mapConnection(row);
  }

  async listExports(context: AuthorizationContext): Promise<BiExportJobSummary[]> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const rows = await this.reporting.listBiExports(context);
    return rows.map(mapExport);
  }

  async createDatasetExport(
    context: AuthorizationContext,
    connectionKey: string,
    exportType: BiExportType = 'full',
  ): Promise<BiExportJobSummary> {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    if (!context.organizationId) {
      throw AppError.forbidden('Organization context is required');
    }

    const connection = await this.reporting.getBiConnection(context, connectionKey);
    if (!connection) {
      throw AppError.notFound('BI connection was not found');
    }

    const job = await this.reporting.createBiExport(context, {
      connectionKey,
      datasetKey: connection.datasetKey,
      exportType,
      status: 'processing',
    });
    if (!job) {
      throw AppError.internal('Failed to create BI export job');
    }

    try {
      const period = snapshotPeriodKey();
      const kpis = await this.reportingService.listKpis(context, period);
      const executive = await this.reportingService.getExecutiveSummary(context);
      const previousExport = await this.reporting.getLatestBiExport(context, connectionKey);
      const previousWatermark = (previousExport?.watermark as Record<string, unknown>) ?? {};

      const kpiRows = kpis.map((kpi) => ({
        snapshotPeriod: kpi.snapshotPeriod,
        domain: kpi.domain,
        kpiKey: kpi.key,
        label: kpi.label,
        value: kpi.value,
        unit: kpi.unit,
        updatedAt: kpi.updatedAt,
      }));

      const executiveRows = [
        {
          snapshotPeriod: executive.snapshotPeriod,
          overallScore: executive.overallScore,
          trendDirection: executive.trendDirection,
          trendDelta: executive.trendDelta,
          updatedAt: new Date().toISOString(),
        },
      ];

      const payload = buildPowerBiDataset({
        datasetKey: connection.datasetKey,
        exportType,
        kpiRows,
        executiveRows,
        watermark: {
          ...previousWatermark,
          lastSnapshotPeriod: period,
          exportType,
        },
      });

      const totalRows = kpiRows.length + executiveRows.length;
      assertExportWithinLimit(totalRows, MAX_BI_EXPORT_ROWS);

      const body = serializePowerBiDataset(payload);
      const fileKey = buildTenantKey(
        context.organizationId,
        'reporting',
        'bi-exports',
        `${job.id}.json`,
      );

      await this.storage.put({
        key: fileKey,
        body,
        contentType: 'application/json',
      });

      const completed = await this.reporting.updateBiExport(context, job.id, {
        status: 'ready',
        fileKey,
        rowCount: kpiRows.length + executiveRows.length,
        watermark: payload.watermark,
        completedAt: new Date(),
      });
      if (!completed) {
        throw AppError.internal('Failed to complete BI export job');
      }

      await this.reporting.updateBiConnection(context, connectionKey, {
        lastSyncAt: new Date(),
      });
      await this.reporting.touchViewRegistry(context, 'bi_exports', {
        refreshStatus: 'idle',
        rowCount: completed.rowCount,
      });

      return mapExport(completed);
    } catch (error) {
      await this.reporting.updateBiExport(context, job.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'BI export failed',
        completedAt: new Date(),
      });
      throw error;
    }
  }

  async getExport(
    context: AuthorizationContext,
    exportId: string,
  ): Promise<BiExportJobSummary> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const row = await this.reporting.getBiExport(context, exportId);
    if (!row) {
      throw AppError.notFound('BI export job was not found');
    }
    return mapExport(row);
  }

  async getDownloadUrl(
    context: AuthorizationContext,
    exportId: string,
  ): Promise<BiExportDownload> {
    requirePermission(context, PERMISSIONS.REPORT_EXPORT);
    const row = await this.reporting.getBiExport(context, exportId);
    if (!row) {
      throw AppError.notFound('BI export job was not found');
    }
    if (row.status !== 'ready' || !row.fileKey) {
      throw AppError.conflict('BI export is not ready for download');
    }

    return {
      exportId: row.id,
      downloadUrl: await this.storage.signedReadUrl({
        key: row.fileKey,
        expiresInSeconds: SIGNED_URL_TTL,
        downloadFilename: `${row.datasetKey}.json`,
      }),
      expiresInSeconds: SIGNED_URL_TTL,
      contentType: 'application/json',
      filename: `${row.datasetKey}.json`,
    };
  }

  async getIncrementalManifest(
    context: AuthorizationContext,
    connectionKey: string,
  ): Promise<BiIncrementalManifest> {
    requirePermission(context, PERMISSIONS.REPORT_READ);
    const connection = await this.reporting.getBiConnection(context, connectionKey);
    if (!connection) {
      throw AppError.notFound('BI connection was not found');
    }

    const latest = await this.reporting.getLatestBiExport(context, connectionKey);
    const watermark = (latest?.watermark as Record<string, unknown>) ?? {
      lastSnapshotPeriod: null,
    };

    return buildIncrementalManifest(
      connection.connectionKey,
      connection.datasetKey,
      watermark,
      latest?.completedAt?.toISOString() ?? null,
    );
  }
}

export function createBiIntegrationService(deps: {
  reporting: ReportingRepository;
  reportingService: ReportingService;
  storage: StorageProvider;
}) {
  return new BiIntegrationService(deps.reporting, deps.reportingService, deps.storage);
}
