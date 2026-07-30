import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireCapa() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('CAPA services are not configured');
  }
  return container.services.capa;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    res.json(await requireCapa().capa.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await requireCapa().capa.list(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_CREATE);
    const created = await requireCapa().capa.create(req.auth, req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/:capaId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    res.json(await requireCapa().capa.get(req.auth, req.params.capaId));
  } catch (error) {
    next(error);
  }
});

router.patch('/:capaId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_UPDATE);
    res.json(await requireCapa().capa.update(req.auth, req.params.capaId, req.body));
  } catch (error) {
    next(error);
  }
});

router.put('/:capaId/rca', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_UPDATE);
    res.json(await requireCapa().capa.saveRca(req.auth, req.params.capaId, req.body));
  } catch (error) {
    next(error);
  }
});

router.get('/:capaId/rca', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    const detail = await requireCapa().capa.get(req.auth, req.params.capaId);
    res.json(detail.rca);
  } catch (error) {
    next(error);
  }
});

router.post('/:capaId/verify', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_VERIFY);
    res.json(await requireCapa().capa.verify(req.auth, req.params.capaId, req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/:capaId/approve', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_APPROVE);
    res.json(await requireCapa().capa.approve(req.auth, req.params.capaId, req.body.comments));
  } catch (error) {
    next(error);
  }
});

router.post('/:capaId/close', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_CLOSE);
    res.json(await requireCapa().capa.close(req.auth, req.params.capaId));
  } catch (error) {
    next(error);
  }
});

router.post('/:capaId/escalate', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_ESCALATE);
    res.json(await requireCapa().capa.escalate(req.auth, req.params.capaId, req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/:capaId/submit-verification', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_UPDATE);
    res.json(await requireCapa().capa.submitForVerification(req.auth, req.params.capaId));
  } catch (error) {
    next(error);
  }
});

export default router;
