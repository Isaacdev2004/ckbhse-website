import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_READ);
    if (container.services === null) {
      throw AppError.serviceUnavailable('CRM services are not configured');
    }
    const metrics = await container.services.dashboard.getMetrics(req.auth);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

export default router;
