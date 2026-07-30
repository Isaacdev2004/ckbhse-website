import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireServices() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('CRM services are not configured');
  }
  return container.services;
}

router.get('/', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_READ);
    const services = requireServices();

    const keyword =
      typeof req.query.q === 'string' ? req.query.q : undefined;
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const priority =
      typeof req.query.priority === 'string' ? req.query.priority : undefined;
    const assignee =
      typeof req.query.assignee === 'string' ? req.query.assignee : undefined;
    const offset = Number(req.query.offset ?? 0);
    const limit = Math.min(Number(req.query.limit ?? 25), 100);

    const page = await services.lead.search(
      req.auth,
      {
        ...(keyword !== undefined ? { keyword } : {}),
        ...(status !== undefined
          ? { status: status as never }
          : {}),
        ...(priority !== undefined
          ? { priority: priority as never }
          : {}),
        ...(assignee !== undefined ? { assignedToUserId: assignee } : {}),
      },
      { kind: 'offset', offset: Number.isFinite(offset) ? offset : 0, limit },
    );

    res.json({
      items: page.items,
      hasMore: page.hasMore,
      total: page.total ?? page.items.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_READ);
    const services = requireServices();
    const lead = await services.lead.getByIdOrFail(req.auth, req.params.id);
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    const services = requireServices();
    const status = req.body?.status;
    if (typeof status !== 'string') {
      throw AppError.badRequest('status is required');
    }
    const lead = await services.lead.transitionStatus(
      req.auth,
      req.params.id,
      status as never,
      typeof req.body?.reason === 'string' ? req.body.reason : null,
    );
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    const services = requireServices();
    const assigneeUserId = req.body?.assigneeUserId;
    if (typeof assigneeUserId !== 'string') {
      throw AppError.badRequest('assigneeUserId is required');
    }
    const lead = await services.lead.assignTo(
      req.auth,
      req.params.id,
      assigneeUserId,
      typeof req.body?.reason === 'string' ? req.body.reason : null,
    );
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/timeline', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_READ);
    const services = requireServices();
    const timeline = await services.timeline.getLeadTimeline(
      req.auth,
      req.params.id,
    );
    res.json({ items: timeline });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notes', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEAD_MANAGE);
    const services = requireServices();
    const body = req.body?.body;
    if (typeof body !== 'string' || body.trim().length === 0) {
      throw AppError.badRequest('body is required');
    }
    const note = await services.timeline.addNote(
      req.auth,
      req.params.id,
      body,
      req.body?.isInternal !== false,
    );
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

export default router;
