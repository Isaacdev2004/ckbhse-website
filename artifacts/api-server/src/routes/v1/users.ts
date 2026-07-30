import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { isAuthenticated } from '@workspace/platform/authorization';
import { container } from '../../container';

const router: IRouter = Router();

router.get('/me', async (req, res, next) => {
  try {
    if (!isAuthenticated(req.auth)) {
      throw AppError.unauthorized();
    }

    if (container.auth === null) {
      throw AppError.serviceUnavailable('Authentication is not configured');
    }

    const profile = await container.auth.getCurrentUser(req.auth);

    res.json({
      userId: profile.user.id,
      organizationId: profile.organizationId,
      roles: [...profile.roles],
      permissions: [...profile.permissions],
      user: profile.user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
