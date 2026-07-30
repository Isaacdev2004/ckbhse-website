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
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    res.json(await requireCompliance().inspection.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/calendar', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const items = await requireCompliance().inspection.listCalendar(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/types', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const items = await requireCompliance().inspection.listTypes(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await requireCompliance().inspection.list(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_CREATE);
    const created = await requireCompliance().inspection.create(req.auth, req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/:inspectionId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    res.json(await requireCompliance().inspection.get(req.auth, req.params.inspectionId));
  } catch (error) {
    next(error);
  }
});

router.patch('/:inspectionId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_UPDATE);
    const updated = await requireCompliance().inspection.update(
      req.auth,
      req.params.inspectionId,
      req.body,
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/:inspectionId/checklist', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const detail = await requireCompliance().inspection.get(
      req.auth,
      req.params.inspectionId,
    );
    res.json({ items: detail.checklist });
  } catch (error) {
    next(error);
  }
});

router.put('/:inspectionId/checklist', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CHECKLIST_MANAGE);
    const saved = await requireCompliance().inspection.saveChecklist(req.auth, {
      inspectionId: req.params.inspectionId,
      ...req.body,
    });
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

router.get('/:inspectionId/findings', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const detail = await requireCompliance().inspection.get(
      req.auth,
      req.params.inspectionId,
    );
    res.json({ items: detail.findings });
  } catch (error) {
    next(error);
  }
});

router.post('/:inspectionId/findings', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_CONDUCT);
    const finding = await requireCompliance().inspection.createFinding(
      req.auth,
      req.params.inspectionId,
      req.body,
    );
    res.status(201).json(finding);
  } catch (error) {
    next(error);
  }
});

router.get('/:inspectionId/evidence', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const detail = await requireCompliance().inspection.get(
      req.auth,
      req.params.inspectionId,
    );
    res.json({ items: detail.evidence });
  } catch (error) {
    next(error);
  }
});

router.post('/:inspectionId/evidence', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.EVIDENCE_UPLOAD);
    const evidence = await requireCompliance().inspection.createEvidence(req.auth, {
      inspectionId: req.params.inspectionId,
      ...req.body,
    });
    res.status(201).json(evidence);
  } catch (error) {
    next(error);
  }
});

export default router;
