import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireRisk() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Risk services are not configured');
  }
  return container.services.risk;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/heatmap', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.getHeatMap(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/matrix', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const items = await requireRisk().risk.getMatrix(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/hazards', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const assessmentId = typeof req.query.assessmentId === 'string' ? req.query.assessmentId : undefined;
    const items = await requireRisk().risk.listHazards(req.auth, assessmentId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/hazards', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const created = await requireRisk().risk.createHazard(req.auth, req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await requireRisk().risk.list(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const created = await requireRisk().risk.create(req.auth, req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/:assessmentId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.get(req.auth, req.params.assessmentId));
  } catch (error) {
    next(error);
  }
});

router.patch('/:assessmentId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.json(await requireRisk().risk.update(req.auth, req.params.assessmentId, req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/:assessmentId/score', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.json(
      await requireRisk().risk.scoreAssessment(req.auth, req.params.assessmentId, req.body),
    );
  } catch (error) {
    next(error);
  }
});

router.post('/:assessmentId/approve', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.json(await requireRisk().risk.approve(req.auth, req.params.assessmentId));
  } catch (error) {
    next(error);
  }
});

router.get('/:assessmentId/treatments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const detail = await requireRisk().risk.get(req.auth, req.params.assessmentId);
    res.json({ items: detail.treatments });
  } catch (error) {
    next(error);
  }
});

router.post('/:assessmentId/treatments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.status(201).json(
      await requireRisk().risk.createTreatment(req.auth, req.params.assessmentId, req.body),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/:assessmentId/reviews', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const detail = await requireRisk().risk.get(req.auth, req.params.assessmentId);
    res.json({ items: detail.reviews });
  } catch (error) {
    next(error);
  }
});

router.post('/:assessmentId/reviews', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.status(201).json(
      await requireRisk().risk.createReview(req.auth, req.params.assessmentId, req.body),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/:assessmentId/bowtie', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const detail = await requireRisk().risk.get(req.auth, req.params.assessmentId);
    res.json({ items: detail.bowtie });
  } catch (error) {
    next(error);
  }
});

router.post('/:assessmentId/bowtie', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    res.status(201).json(
      await requireRisk().risk.createBowtieElement(req.auth, req.params.assessmentId, req.body),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
