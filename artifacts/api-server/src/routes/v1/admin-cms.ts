import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { container } from '../../container';

const router: IRouter = Router();

function requireCms() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('CMS services are not configured');
  }
  return container.services.cms;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    res.json(await requireCms().getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/entries', async (req, res, next) => {
  try {
    const contentType =
      typeof req.query.contentType === 'string' ? req.query.contentType : undefined;
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const keyword =
      typeof req.query.keyword === 'string' && req.query.keyword.trim().length > 0
        ? req.query.keyword.trim()
        : undefined;
    const pendingClientApproval =
      req.query.pendingClientApproval === 'true' ? true : undefined;
    const filters: {
      contentType?: string;
      status?: string;
      keyword?: string;
      pendingClientApproval?: boolean;
    } = {};
    if (contentType !== undefined) {
      filters.contentType = contentType;
    }
    if (status !== undefined) {
      filters.status = status;
    }
    if (keyword !== undefined) {
      filters.keyword = keyword;
    }
    if (pendingClientApproval !== undefined) {
      filters.pendingClientApproval = pendingClientApproval;
    }
    const items = await requireCms().listEntries(req.auth, filters as never);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/entries', async (req, res, next) => {
  try {
    const entry = await requireCms().createEntry(req.auth, req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.get('/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const entry = await requireCms().getEntry(req.auth, entryId);
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.patch('/entries/:entryId/draft', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    if (req.body?.payload === undefined) {
      throw AppError.badRequest('payload is required');
    }
    const entry = await requireCms().updateDraft(req.auth, entryId, req.body);
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/entries/:entryId/publish', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const entry = await requireCms().publishEntry(req.auth, entryId);
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/entries/:entryId/approve-client', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const entry = await requireCms().approveClientEntry(req.auth, entryId);
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/entries/:entryId/schedule', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const scheduledAt = req.body?.scheduledAt;
    if (typeof scheduledAt !== 'string') {
      throw AppError.badRequest('scheduledAt is required');
    }
    const entry = await requireCms().scheduleEntry(req.auth, entryId, {
      scheduledAt,
      reviewDueAt:
        req.body?.reviewDueAt === null
          ? null
          : typeof req.body?.reviewDueAt === 'string'
            ? req.body.reviewDueAt
            : undefined,
    });
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.get('/approvals/pending', async (req, res, next) => {
  try {
    const items = await requireCms().listEntries(req.auth, {
      pendingClientApproval: true,
    });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/workflow/run-due', async (req, res, next) => {
  try {
    res.json(await requireCms().runDueWorkflow(req.auth));
  } catch (error) {
    next(error);
  }
});

router.post('/entries/:entryId/archive', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const entry = await requireCms().archiveEntry(req.auth, entryId);
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/entries/:entryId/rollback', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    const versionId = req.body?.versionId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    if (typeof versionId !== 'string') {
      throw AppError.badRequest('versionId is required');
    }
    const entry = await requireCms().rollbackEntry(req.auth, entryId, versionId);
    if (!entry) {
      throw AppError.notFound('CMS entry or version not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/import-from-files', async (req, res, next) => {
  try {
    const skipExisting = req.body?.skipExisting !== false;
    res.json(await requireCms().importFromFiles(req.auth, { skipExisting }));
  } catch (error) {
    next(error);
  }
});

function requireCmsMedia() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('CMS services are not configured');
  }
  return container.services.cmsMedia;
}

router.get('/media', async (req, res, next) => {
  try {
    const items = await requireCmsMedia().listMedia(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/media', async (req, res, next) => {
  try {
    const { key, filename, mimeType, dataBase64, altText, caption } = req.body ?? {};
    if (typeof key !== 'string' || typeof filename !== 'string') {
      throw AppError.badRequest('key and filename are required');
    }
    if (typeof mimeType !== 'string' || typeof dataBase64 !== 'string') {
      throw AppError.badRequest('mimeType and dataBase64 are required');
    }
    const asset = await requireCmsMedia().uploadMedia(req.auth, {
      key,
      filename,
      mimeType,
      dataBase64,
      altText: typeof altText === 'string' ? altText : null,
      caption: typeof caption === 'string' ? caption : null,
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

router.get('/seo', async (req, res, next) => {
  try {
    const items = await requireCmsMedia().listSeoEntries(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.patch('/seo/:entryId', async (req, res, next) => {
  try {
    const entryId = req.params.entryId;
    if (!entryId) {
      throw AppError.badRequest('Entry id is required');
    }
    const seo = req.body?.seo;
    if (seo === undefined || typeof seo !== 'object' || seo === null) {
      throw AppError.badRequest('seo object is required');
    }
    const entry = await requireCmsMedia().updateSeo(
      req.auth,
      entryId,
      seo as Record<string, unknown>,
    );
    if (!entry) {
      throw AppError.notFound('CMS entry not found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

export default router;
