import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { container } from '../../container';

const router: IRouter = Router();

function requireReporting() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Reporting services are not configured');
  }
  return container.services.reporting;
}

router.get('/kpi-definitions', async (req, res, next) => {
  try {
    res.json({ items: requireReporting().reporting.listKpiDefinitions() });
  } catch (error) {
    next(error);
  }
});

router.get('/kpis', async (req, res, next) => {
  try {
    const snapshotPeriod =
      typeof req.query.snapshotPeriod === 'string'
        ? req.query.snapshotPeriod
        : undefined;
    const items = await requireReporting().reporting.listKpis(req.auth, snapshotPeriod);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/executive-summary', async (req, res, next) => {
  try {
    res.json(await requireReporting().reporting.getExecutiveSummary(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/views', async (req, res, next) => {
  try {
    const items = await requireReporting().reporting.listViewRegistry(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/definitions', async (req, res, next) => {
  try {
    const items = await requireReporting().reporting.listReportDefinitions(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    res.status(202).json(await requireReporting().reporting.refreshSnapshots(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/widgets/catalog', async (_req, res, next) => {
  try {
    res.json({ items: requireReporting().dashboard.listWidgetCatalog() });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboards', async (req, res, next) => {
  try {
    const items = await requireReporting().dashboard.listDashboards(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboards/:dashboardKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().dashboard.getDashboard(req.auth, req.params.dashboardKey),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/dashboards/:dashboardKey/layout', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().dashboard.getUserLayout(req.auth, req.params.dashboardKey),
    );
  } catch (error) {
    next(error);
  }
});

router.put('/dashboards/:dashboardKey/layout', async (req, res, next) => {
  try {
    const layout = Array.isArray(req.body?.layout) ? req.body.layout : [];
    res.json(
      await requireReporting().dashboard.saveUserLayout(
        req.auth,
        req.params.dashboardKey,
        layout,
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const items = await requireReporting().reportBuilder.listReports(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/reports', async (req, res, next) => {
  try {
    res.status(201).json(
      await requireReporting().reportBuilder.createReport(req.auth, {
        reportKey: String(req.body?.reportKey ?? ''),
        title: String(req.body?.title ?? ''),
        domain: req.body?.domain,
        definition: req.body?.definition ?? { sourceType: 'kpi' },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/reports/:reportKey', async (req, res, next) => {
  try {
    res.json(await requireReporting().reportBuilder.getReport(req.auth, req.params.reportKey));
  } catch (error) {
    next(error);
  }
});

router.patch('/reports/:reportKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().reportBuilder.updateReport(req.auth, req.params.reportKey, {
        ...(req.body?.title !== undefined ? { title: String(req.body.title) } : {}),
        ...(req.body?.domain !== undefined ? { domain: req.body.domain } : {}),
        ...(req.body?.definition !== undefined ? { definition: req.body.definition } : {}),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.delete('/reports/:reportKey', async (req, res, next) => {
  try {
    await requireReporting().reportBuilder.deleteReport(req.auth, req.params.reportKey);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/reports/:reportKey/run', async (req, res, next) => {
  try {
    res.json(await requireReporting().reportBuilder.runReport(req.auth, req.params.reportKey));
  } catch (error) {
    next(error);
  }
});

router.get('/exports', async (req, res, next) => {
  try {
    const items = await requireReporting().reportExport.listExports(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/reports/:reportKey/export', async (req, res, next) => {
  try {
    const format =
      typeof req.body?.format === 'string' ? req.body.format : 'csv';
    res.status(201).json(
      await requireReporting().reportExport.createExport(
        req.auth,
        req.params.reportKey,
        format as 'csv' | 'xlsx' | 'pdf',
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/exports/:jobId', async (req, res, next) => {
  try {
    res.json(await requireReporting().reportExport.getExport(req.auth, req.params.jobId));
  } catch (error) {
    next(error);
  }
});

router.get('/exports/:jobId/download', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().reportExport.getDownloadUrl(req.auth, req.params.jobId),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/schedules', async (req, res, next) => {
  try {
    const items = await requireReporting().reportSchedule.listSchedules(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/schedules', async (req, res, next) => {
  try {
    res.status(201).json(
      await requireReporting().reportSchedule.createSchedule(req.auth, {
        scheduleKey: String(req.body?.scheduleKey ?? ''),
        reportKey: String(req.body?.reportKey ?? ''),
        title: String(req.body?.title ?? ''),
        cadence: req.body?.cadence ?? 'weekly',
        timeUtc: String(req.body?.timeUtc ?? '08:00'),
        format: req.body?.format ?? 'pdf',
        recipients: Array.isArray(req.body?.recipients) ? req.body.recipients : [],
        enabled: req.body?.enabled !== false,
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/schedules/:scheduleKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().reportSchedule.getSchedule(req.auth, req.params.scheduleKey),
    );
  } catch (error) {
    next(error);
  }
});

router.patch('/schedules/:scheduleKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().reportSchedule.updateSchedule(
        req.auth,
        req.params.scheduleKey,
        {
          ...(req.body?.title !== undefined ? { title: String(req.body.title) } : {}),
          ...(req.body?.cadence !== undefined ? { cadence: req.body.cadence } : {}),
          ...(req.body?.timeUtc !== undefined ? { timeUtc: String(req.body.timeUtc) } : {}),
          ...(req.body?.format !== undefined ? { format: req.body.format } : {}),
          ...(Array.isArray(req.body?.recipients) ? { recipients: req.body.recipients } : {}),
          ...(req.body?.enabled !== undefined ? { enabled: Boolean(req.body.enabled) } : {}),
        },
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.delete('/schedules/:scheduleKey', async (req, res, next) => {
  try {
    await requireReporting().reportSchedule.deleteSchedule(
      req.auth,
      req.params.scheduleKey,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/schedules/run-due', async (req, res, next) => {
  try {
    res.json(await requireReporting().reportSchedule.runDueSchedules(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/bi/connections', async (req, res, next) => {
  try {
    const items = await requireReporting().biIntegration.listConnections(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/bi/connections', async (req, res, next) => {
  try {
    res.status(201).json(
      await requireReporting().biIntegration.createConnection(req.auth, {
        connectionKey: String(req.body?.connectionKey ?? ''),
        workspaceId: String(req.body?.workspaceId ?? ''),
        datasetName: String(req.body?.datasetName ?? ''),
        datasetKey: String(req.body?.datasetKey ?? ''),
        enabled: req.body?.enabled !== false,
        metadata: req.body?.metadata,
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/bi/connections/:connectionKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().biIntegration.getConnection(req.auth, req.params.connectionKey),
    );
  } catch (error) {
    next(error);
  }
});

router.patch('/bi/connections/:connectionKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().biIntegration.updateConnection(req.auth, req.params.connectionKey, {
        ...(req.body?.workspaceId !== undefined
          ? { workspaceId: String(req.body.workspaceId) }
          : {}),
        ...(req.body?.datasetName !== undefined
          ? { datasetName: String(req.body.datasetName) }
          : {}),
        ...(req.body?.datasetKey !== undefined
          ? { datasetKey: String(req.body.datasetKey) }
          : {}),
        ...(req.body?.enabled !== undefined ? { enabled: Boolean(req.body.enabled) } : {}),
        ...(req.body?.metadata !== undefined ? { metadata: req.body.metadata } : {}),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/bi/connections/:connectionKey/manifest', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().biIntegration.getIncrementalManifest(
        req.auth,
        req.params.connectionKey,
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/bi/exports', async (req, res, next) => {
  try {
    const items = await requireReporting().biIntegration.listExports(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/bi/connections/:connectionKey/export', async (req, res, next) => {
  try {
    const exportType =
      req.body?.exportType === 'incremental' ? 'incremental' : 'full';
    res.status(201).json(
      await requireReporting().biIntegration.createDatasetExport(
        req.auth,
        req.params.connectionKey,
        exportType,
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/bi/exports/:exportId', async (req, res, next) => {
  try {
    res.json(await requireReporting().biIntegration.getExport(req.auth, req.params.exportId));
  } catch (error) {
    next(error);
  }
});

router.get('/bi/exports/:exportId/download', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().biIntegration.getDownloadUrl(req.auth, req.params.exportId),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/benchmarks/cohorts', async (req, res, next) => {
  try {
    const items = await requireReporting().benchmark.listCohorts(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/benchmarks/compare', async (req, res, next) => {
  try {
    const cohortKey =
      typeof req.query.cohortKey === 'string' ? req.query.cohortKey : undefined;
    const snapshotPeriod =
      typeof req.query.snapshotPeriod === 'string' ? req.query.snapshotPeriod : undefined;
    res.json(await requireReporting().benchmark.compareOrganization(req.auth, cohortKey, snapshotPeriod));
  } catch (error) {
    next(error);
  }
});

router.get('/trends/:kpiKey', async (req, res, next) => {
  try {
    res.json(await requireReporting().trendAnalysis.analyzeKpi(req.auth, req.params.kpiKey));
  } catch (error) {
    next(error);
  }
});

router.get('/forecasts', async (req, res, next) => {
  try {
    const items = await requireReporting().predictiveAnalytics.listForecasts(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/forecasts/refresh', async (req, res, next) => {
  try {
    const items = await requireReporting().predictiveAnalytics.refreshForecasts(req.auth);
    res.status(202).json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/forecasts/:kpiKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().predictiveAnalytics.getForecast(req.auth, req.params.kpiKey),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions', async (req, res, next) => {
  try {
    const items = await requireReporting().kpiSubscription.listSubscriptions(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/subscriptions', async (req, res, next) => {
  try {
    res.status(201).json(
      await requireReporting().kpiSubscription.createSubscription(req.auth, {
        subscriptionKey: String(req.body?.subscriptionKey ?? ''),
        kpiKey: String(req.body?.kpiKey ?? ''),
        domain: req.body?.domain,
        thresholdOperator: req.body?.thresholdOperator,
        thresholdValue: Number(req.body?.thresholdValue ?? 0),
        channel: req.body?.channel,
        enabled: req.body?.enabled !== false,
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions/:subscriptionKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().kpiSubscription.getSubscription(
        req.auth,
        req.params.subscriptionKey,
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.patch('/subscriptions/:subscriptionKey', async (req, res, next) => {
  try {
    res.json(
      await requireReporting().kpiSubscription.updateSubscription(
        req.auth,
        req.params.subscriptionKey,
        {
          ...(req.body?.thresholdOperator !== undefined
            ? { thresholdOperator: req.body.thresholdOperator }
            : {}),
          ...(req.body?.thresholdValue !== undefined
            ? { thresholdValue: Number(req.body.thresholdValue) }
            : {}),
          ...(req.body?.channel !== undefined ? { channel: req.body.channel } : {}),
          ...(req.body?.enabled !== undefined ? { enabled: Boolean(req.body.enabled) } : {}),
        },
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.delete('/subscriptions/:subscriptionKey', async (req, res, next) => {
  try {
    await requireReporting().kpiSubscription.deleteSubscription(
      req.auth,
      req.params.subscriptionKey,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/subscriptions/evaluate', async (req, res, next) => {
  try {
    res.json(await requireReporting().kpiSubscription.evaluateSubscriptions(req.auth));
  } catch (error) {
    next(error);
  }
});

export default router;
