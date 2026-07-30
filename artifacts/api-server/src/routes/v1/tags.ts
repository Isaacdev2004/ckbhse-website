import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_READ);
    if (container.dataLayer === null) {
      throw AppError.serviceUnavailable('CRM services are not configured');
    }
    const tags = await container.dataLayer.leadTagRepository.list(req.auth);
    res.json({ items: tags });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    if (container.dataLayer === null) {
      throw AppError.serviceUnavailable('CRM services are not configured');
    }
    const name = req.body?.name;
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw AppError.badRequest('name is required');
    }
    const tag = await container.dataLayer.leadTagRepository.create(req.auth, {
      name: name.trim(),
      color: typeof req.body?.color === 'string' ? req.body.color : null,
    });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
});

export default router;
