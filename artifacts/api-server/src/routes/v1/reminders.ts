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
    const leadId =
      typeof req.query.leadId === 'string' ? req.query.leadId : undefined;
    if (leadId === undefined) {
      throw AppError.badRequest('leadId query parameter is required');
    }
    const items = await container.services.reminders.listForLead(
      req.auth,
      leadId,
    );
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    if (container.services === null) {
      throw AppError.serviceUnavailable('CRM services are not configured');
    }
    const { leadId, title, dueAt } = req.body ?? {};
    if (
      typeof leadId !== 'string' ||
      typeof title !== 'string' ||
      typeof dueAt !== 'string'
    ) {
      throw AppError.badRequest('leadId, title, and dueAt are required');
    }
    const result = await container.services.reminders.create(req.auth, {
      leadId,
      title,
      dueAt: new Date(dueAt),
      ...(typeof req.body.priority === 'string'
        ? { priority: req.body.priority }
        : {}),
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/complete', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    if (container.services === null) {
      throw AppError.serviceUnavailable('CRM services are not configured');
    }
    await container.services.reminders.complete(req.auth, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
