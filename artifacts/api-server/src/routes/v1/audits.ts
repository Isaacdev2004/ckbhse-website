import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireAudit() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Audit services are not configured');
  }
  return container.services.audit;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    res.json(await audit.audit.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/types', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listTypes(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/calendar', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.calendar.listEvents(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/templates', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listTemplates(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/templates/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const detail = await audit.audit.getTemplateDetail(req.auth, req.params.id);
    if (detail === null) {
      throw AppError.notFound('Template not found');
    }
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await audit.audit.list(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_CREATE);
    const audit = requireAudit();
    const created = await audit.audit.create(req.auth, req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    res.json(await audit.audit.get(req.auth, req.params.auditId));
  } catch (error) {
    next(error);
  }
});

router.patch('/:auditId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_UPDATE);
    const audit = requireAudit();
    const updated = await audit.audit.update(
      req.auth,
      req.params.auditId,
      req.body,
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post('/:auditId/approve', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_APPROVE);
    const audit = requireAudit();
    res.json(await audit.audit.approve(req.auth, req.params.auditId));
  } catch (error) {
    next(error);
  }
});

router.post('/:auditId/close', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_CLOSE);
    const audit = requireAudit();
    res.json(await audit.audit.close(req.auth, req.params.auditId));
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/checklist', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listChecklist(req.auth, req.params.auditId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.put('/:auditId/checklist', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CHECKLIST_MANAGE);
    const audit = requireAudit();
    const saved = await audit.audit.saveChecklistResponse(req.auth, {
      auditId: req.params.auditId,
      ...req.body,
    });
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/findings', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listFindings(req.auth, req.params.auditId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/:auditId/findings', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_CONDUCT);
    const audit = requireAudit();
    const finding = await audit.audit.createFinding(
      req.auth,
      req.params.auditId,
      req.body,
    );
    res.status(201).json(finding);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/evidence', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listEvidence(req.auth, req.params.auditId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/:auditId/evidence', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.EVIDENCE_UPLOAD);
    const audit = requireAudit();
    const evidence = await audit.audit.createEvidence(req.auth, {
      auditId: req.params.auditId,
      ...req.body,
    });
    res.status(201).json(evidence);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/assignments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listAssignments(req.auth, req.params.auditId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/:auditId/assignments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_ASSIGN);
    const audit = requireAudit();
    const assignment = await audit.audit.assign(req.auth, {
      auditId: req.params.auditId,
      ...req.body,
    });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/report', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const reportType =
      typeof req.query.type === 'string' ? req.query.type : 'executive';
    const report = await audit.reports.generate(
      req.auth,
      req.params.auditId,
      reportType,
    );
    if (report === null) {
      throw AppError.notFound('Audit not found');
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/:auditId/history', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listHistory(req.auth, req.params.auditId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

export default router;
