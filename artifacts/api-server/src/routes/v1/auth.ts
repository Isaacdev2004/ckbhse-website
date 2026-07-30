import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { isAuthenticated } from '@workspace/platform/authorization';
import { asSessionId } from '@workspace/platform/authorization';
import { isDevelopment } from '../../config';
import { container } from '../../container';
import { authRateLimiter } from '../../middleware/security';

const router: IRouter = Router();

function requireAuthService() {
  if (container.services === null || container.auth === null) {
    throw AppError.serviceUnavailable('Authentication is not configured');
  }
  return { auth: container.auth, sessionCookies: container.sessionCookies };
}

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { auth, sessionCookies } = requireAuthService();
    if (sessionCookies === null) {
      throw AppError.serviceUnavailable('Authentication is not configured');
    }

    const email = req.body?.email;
    const password = req.body?.password;
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw AppError.badRequest('email and password are required');
    }

    const result = await auth.login({
      email,
      password,
      rememberMe: req.body?.rememberMe === true,
      metadata: req.auth.metadata,
      ...(typeof req.body?.organizationId === 'string'
        ? { organizationId: req.body.organizationId }
        : {}),
    });

    res.setHeader(
      'Set-Cookie',
      sessionCookies.buildSetCookieHeader(result.sessionId),
    );

    await container.audit.record(result.context, {
      entity: 'auth_session',
      entityId: result.sessionId,
      action: 'create',
    });

    res.json({
      userId: result.context.userId,
      organizationId: result.context.organizationId,
      roles: [...result.context.roles],
      permissions: [...result.context.permissions],
      user: result.user,
    });
  } catch (error) {
    await container.audit
      .record(req.auth, {
        entity: 'auth_attempt',
        entityId: 'login',
        action: 'read',
        metadata: { outcome: 'failed' },
      })
      .catch(() => undefined);
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { auth, sessionCookies } = requireAuthService();
    if (sessionCookies === null) {
      throw AppError.serviceUnavailable('Authentication is not configured');
    }

    const parsed = sessionCookies.parseCookieHeader(req.headers.cookie);
    if (parsed !== null) {
      await auth.logout(asSessionId(parsed.sessionId));
      await container.audit.record(req.auth, {
        entity: 'auth_session',
        entityId: parsed.sessionId,
        action: 'delete',
      });
    }

    res.setHeader('Set-Cookie', sessionCookies.buildClearCookieHeader());
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/session', async (req, res, next) => {
  try {
    if (!isAuthenticated(req.auth) || req.auth.userId === undefined) {
      throw AppError.unauthorized(
        isDevelopment
          ? 'No session. Log in at /staff/login or send dev headers in development.'
          : 'Authentication is required',
      );
    }

    if (req.auth.organizationId === undefined) {
      throw AppError.unauthorized('Session is missing organization scope');
    }

    res.json({
      userId: req.auth.userId,
      organizationId: req.auth.organizationId,
      roles: [...req.auth.roles],
      permissions: [...req.auth.permissions],
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { auth, sessionCookies } = requireAuthService();
    if (sessionCookies === null) {
      throw AppError.serviceUnavailable('Authentication is not configured');
    }

    const parsed = sessionCookies.parseCookieHeader(req.headers.cookie);
    if (parsed === null) {
      throw AppError.unauthorized();
    }

    const context = await auth.refreshSession(
      asSessionId(parsed.sessionId),
      req.auth.metadata,
    );
    if (context === null) {
      throw AppError.unauthorized();
    }

    res.setHeader(
      'Set-Cookie',
      sessionCookies.buildSetCookieHeader(asSessionId(parsed.sessionId)),
    );

    res.json({
      userId: context.userId,
      organizationId: context.organizationId,
      roles: [...context.roles],
      permissions: [...context.permissions],
    });
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', authRateLimiter, async (req, res, next) => {
  try {
    const { auth } = requireAuthService();
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;
    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      throw AppError.badRequest('currentPassword and newPassword are required');
    }

    await auth.changePassword(req.auth, currentPassword, newPassword);
    await container.audit.record(req.auth, {
      entity: 'user_credential',
      entityId: req.auth.userId ?? 'unknown',
      action: 'update',
      metadata: { reason: 'password_change' },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post(
  '/request-password-reset',
  authRateLimiter,
  async (req, res, next) => {
    try {
      const { auth } = requireAuthService();
      const email = req.body?.email;
      if (typeof email !== 'string') {
        throw AppError.badRequest('email is required');
      }

      const token = await auth.requestPasswordReset(email, req.ip);
      await container.audit.record(req.auth, {
        entity: 'password_reset',
        entityId: email,
        action: 'create',
        metadata: { requested: token !== null },
      });
      res.json({
        message:
          'If an account exists for that email, password reset instructions will be sent.',
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post('/reset-password', authRateLimiter, async (req, res, next) => {
  try {
    const { auth } = requireAuthService();
    const token = req.body?.token;
    const newPassword = req.body?.newPassword;
    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      throw AppError.badRequest('token and newPassword are required');
    }

    await auth.resetPassword(token, newPassword);
    await container.audit.record(req.auth, {
      entity: 'password_reset',
      entityId: 'complete',
      action: 'update',
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
