import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { container } from '../../container';
import cmsRouter from './admin-cms';

const router: IRouter = Router();

function requireAdmin() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Admin services are not configured');
  }
  return container.services.admin;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    res.json(await requireAdmin().getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/organizations', async (req, res, next) => {
  try {
    const items = await requireAdmin().listOrganizations(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const keyword =
      typeof req.query.keyword === 'string' && req.query.keyword.trim().length > 0
        ? req.query.keyword.trim()
        : undefined;
    const items = await requireAdmin().listUsers(req.auth, keyword);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/roles', async (req, res, next) => {
  try {
    const items = await requireAdmin().listRoles(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/permissions', async (req, res, next) => {
  try {
    const items = await requireAdmin().listPermissions(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const limitRaw = req.query.limit;
    const limit =
      typeof limitRaw === 'string' && limitRaw.length > 0 ? Number(limitRaw) : undefined;
    const filters: {
      organizationId?: string;
      entity?: string;
      entityId?: string;
      actorUserId?: string;
      requestId?: string;
      action?: string;
      limit?: number;
    } = {};
    if (typeof req.query.organizationId === 'string') {
      filters.organizationId = req.query.organizationId;
    }
    if (typeof req.query.entity === 'string') {
      filters.entity = req.query.entity;
    }
    if (typeof req.query.entityId === 'string') {
      filters.entityId = req.query.entityId;
    }
    if (typeof req.query.actorUserId === 'string') {
      filters.actorUserId = req.query.actorUserId;
    }
    if (typeof req.query.requestId === 'string') {
      filters.requestId = req.query.requestId;
    }
    if (typeof req.query.action === 'string') {
      filters.action = req.query.action;
    }
    if (limit !== undefined && !Number.isNaN(limit)) {
      filters.limit = limit;
    }
    const items = await requireAdmin().searchAuditLogs(req.auth, filters);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/feature-flags', async (req, res, next) => {
  try {
    const items = await requireAdmin().listFeatureFlags(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.patch('/feature-flags/:key', async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!key) {
      throw AppError.badRequest('Feature flag key is required');
    }
    const enabled = req.body?.enabled;
    if (typeof enabled !== 'boolean') {
      throw AppError.badRequest('enabled must be a boolean');
    }
    const description =
      req.body?.description === null || typeof req.body?.description === 'string'
        ? req.body.description
        : undefined;
    const row = await requireAdmin().updateFeatureFlag(req.auth, key, {
      enabled,
      ...(description !== undefined ? { description } : {}),
    });
    if (row === null) {
      throw AppError.notFound('Feature flag not found');
    }
    res.json(row);
  } catch (error) {
    next(error);
  }
});

router.get('/system/health', async (req, res, next) => {
  try {
    res.json(await requireAdmin().getSystemHealth(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/system/version', async (req, res, next) => {
  try {
    res.json(await requireAdmin().getSystemVersion(req.auth));
  } catch (error) {
    next(error);
  }
});

router.use('/cms', cmsRouter);

export default router;
