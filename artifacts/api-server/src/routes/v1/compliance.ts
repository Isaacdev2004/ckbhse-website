import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireCompliance() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Compliance services are not configured');
  }
  return container.services.compliance;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().compliance.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/workspace', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().compliance.getWorkspace(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/calendar', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const items = await requireCompliance().compliance.listCalendar(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/score', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().compliance.getScore(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/legal-register', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEGAL_REGISTER_READ);
    const items = await requireCompliance().legal.list(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/legal-register', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEGAL_REGISTER_MANAGE);
    const entry = await requireCompliance().legal.create(req.auth, req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.get('/regulations', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_READ);
    const items = await requireCompliance().regulatory.list(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/controls', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CONTROL_READ);
    const items = await requireCompliance().control.list(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/controls', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CONTROL_MANAGE);
    const control = await requireCompliance().control.create(req.auth, req.body);
    res.status(201).json(control);
  } catch (error) {
    next(error);
  }
});

router.get('/frameworks', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const items = await requireCompliance().compliance.listIsoFrameworks(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/frameworks/:id/clauses', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const items = await requireCompliance().compliance.listIsoClauses(
      req.auth,
      req.params.id,
    );
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/executive', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().analytics.getExecutiveDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/kpis', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().analytics.getKpis(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/trends', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().analytics.getTrends(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/regulatory', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_READ);
    res.json(await requireCompliance().analytics.getRegulatoryMonitoring(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/iso', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const frameworkId = typeof req.query.frameworkId === 'string' ? req.query.frameworkId : undefined;
    res.json(await requireCompliance().analytics.getIsoDashboard(req.auth, frameworkId));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/controls', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CONTROL_READ);
    res.json(await requireCompliance().analytics.getControlEffectiveness(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/performance', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().analytics.getPerformanceAnalytics(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/alerts', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_READ);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await requireCompliance().analytics.listAlerts(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/analytics/alerts/:alertId/acknowledge', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_MANAGE);
    res.json(await requireCompliance().analytics.acknowledgeAlert(req.auth, req.params.alertId));
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/exports', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const items = await requireCompliance().analytics.listExports(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/analytics/exports', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_MANAGE);
    const job = await requireCompliance().analytics.createExport(req.auth, req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.post('/analytics/calendar/sync', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_MANAGE);
    res.json(await requireCompliance().analytics.syncCalendarAutomation(req.auth));
  } catch (error) {
    next(error);
  }
});

router.post('/analytics/snapshot', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_MANAGE);
    res.status(201).json(await requireCompliance().analytics.recordCurrentKpiSnapshot(req.auth));
  } catch (error) {
    next(error);
  }
});

export default router;
