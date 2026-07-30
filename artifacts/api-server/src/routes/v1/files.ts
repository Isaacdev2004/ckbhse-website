import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { isAuthenticated } from '@workspace/platform/authorization';
import { container } from '../../container';

const router: IRouter = Router();

function requireFiles() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('File services are not configured');
  }
  return container.services.files;
}

router.post('/', async (req, res, next) => {
  try {
    if (!isAuthenticated(req.auth)) {
      throw AppError.unauthorized();
    }

    const {
      originalFilename,
      contentType,
      sizeBytes,
      domain,
      entityType,
      entityId,
    } = req.body ?? {};

    if (typeof originalFilename !== 'string' || typeof contentType !== 'string') {
      throw AppError.badRequest('originalFilename and contentType are required');
    }
    if (!Number.isFinite(Number(sizeBytes))) {
      throw AppError.badRequest('sizeBytes is required');
    }
    if (typeof domain !== 'string') {
      throw AppError.badRequest('domain is required');
    }

    const result = await requireFiles().initiateUpload(req.auth, {
      originalFilename,
      contentType,
      sizeBytes: Number(sizeBytes),
      domain,
      entityType: typeof entityType === 'string' ? entityType : null,
      entityId: typeof entityId === 'string' ? entityId : null,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:uploadId/complete', async (req, res, next) => {
  try {
    if (!isAuthenticated(req.auth)) {
      throw AppError.unauthorized();
    }

    const uploadId = req.params.uploadId;
    if (!uploadId) {
      throw AppError.badRequest('Upload id is required');
    }

    res.json(await requireFiles().completeUpload(req.auth, uploadId));
  } catch (error) {
    next(error);
  }
});

router.get('/:uploadId/download', async (req, res, next) => {
  try {
    if (!isAuthenticated(req.auth)) {
      throw AppError.unauthorized();
    }

    const uploadId = req.params.uploadId;
    if (!uploadId) {
      throw AppError.badRequest('Upload id is required');
    }

    res.json(await requireFiles().getDownloadGrant(req.auth, uploadId));
  } catch (error) {
    next(error);
  }
});

export default router;
