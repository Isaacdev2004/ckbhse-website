import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { container } from '../../container';

const router: IRouter = Router();

function requirePublicContent() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Content services are not configured');
  }
  return container.services.publicContent;
}

router.get('/entries', async (req, res, next) => {
  try {
    const locale =
      typeof req.query.locale === 'string' ? req.query.locale : 'en-GB';
    const items = await requirePublicContent().listPublished(locale);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/snapshot', async (req, res, next) => {
  try {
    const locale =
      typeof req.query.locale === 'string' ? req.query.locale : 'en-GB';
    res.json(await requirePublicContent().buildSnapshot(locale));
  } catch (error) {
    next(error);
  }
});

router.get('/by-path', async (req, res, next) => {
  try {
    const path = typeof req.query.path === 'string' ? req.query.path : undefined;
    if (!path) {
      throw AppError.badRequest('path query parameter is required');
    }
    const locale =
      typeof req.query.locale === 'string' ? req.query.locale : 'en-GB';
    const entry = await requirePublicContent().getByPath(path, locale);
    if (!entry) {
      throw AppError.notFound('Published content not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

export default router;
