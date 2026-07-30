import { isAuthenticated } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import type { RequestHandler } from 'express';
import { isDevelopment } from '../config';

/** Development-only headers that impersonate a staff user. */
const DEV_USER_HEADER = 'x-dev-user-id';
const DEV_ORG_HEADER = 'x-dev-organization-id';
const DEV_ROLE_HEADER = 'x-dev-role';

const DEV_CONSULTANT_PERMISSIONS = [
  PERMISSIONS.STAFF_ACCESS,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.ENQUIRY_MANAGE,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.LEAD_MANAGE,
  PERMISSIONS.CLIENT_READ,
] as const;

/**
 * Resolves a development identity from trusted headers.
 *
 * Only active when NODE_ENV is development. Production requests are never
 * affected. Real session authentication replaces this in M2.3.
 */
export const devAuth: RequestHandler = (req, _res, next) => {
  if (!isDevelopment) {
    next();
    return;
  }

  if (isAuthenticated(req.auth)) {
    next();
    return;
  }

  const userId = req.headers[DEV_USER_HEADER];
  const organizationId = req.headers[DEV_ORG_HEADER];
  const role =
    typeof req.headers[DEV_ROLE_HEADER] === 'string'
      ? req.headers[DEV_ROLE_HEADER]
      : 'consultant';

  if (typeof userId !== 'string' || typeof organizationId !== 'string') {
    next();
    return;
  }

  const metadata = {
    requestId: req.requestId,
    ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
    ...(typeof req.headers['user-agent'] === 'string'
      ? { userAgent: req.headers['user-agent'] }
      : {}),
  };

  const context: AuthorizationContext = createUserContext({
    userId: asUserId(userId),
    organizationId: asOrganizationId(organizationId),
    roles: [role],
    permissions: [...DEV_CONSULTANT_PERMISSIONS],
    metadata,
  });

  req.auth = context;
  next();
};

export const DEV_DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000010';
export const DEV_DEFAULT_ORG_ID = '00000000-0000-4000-8000-000000000001';
