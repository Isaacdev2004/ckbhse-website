import { Router, type IRouter } from 'express';
import { getPool } from '@workspace/db';
import { AppError } from '@workspace/platform/errors';
import { databaseConfig } from '../../config';
import { container } from '../../container';

const router: IRouter = Router();

async function probeDatabase(): Promise<boolean> {
  if (!databaseConfig.configured) {
    return false;
  }

  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

router.get('/health', async (_req, res, next) => {
  try {
    if (container.services === null) {
      throw AppError.serviceUnavailable(
        'Platform services are not configured',
      );
    }

    const databaseHealthy = await probeDatabase();
    const status = databaseHealthy ? 'healthy' : 'degraded';
    const metadata = container.services.system.getHealth(status);

    res.json({
      status: metadata.status,
      timestamp: metadata.timestamp.toISOString(),
      version: metadata.version,
      environment: metadata.environment,
      uptimeSeconds: metadata.uptimeSeconds,
      service: metadata.service,
      checks: {
        database: databaseHealthy ? 'ok' : 'unavailable',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/version', (_req, res, next) => {
  try {
    if (container.services === null) {
      throw AppError.serviceUnavailable(
        'Platform services are not configured',
      );
    }

    const info = container.services.system.getVersionInfo();

    res.json({
      version: info.version,
      environment: info.environment,
      buildSha: info.buildSha,
      buildTime: info.buildTime?.toISOString() ?? null,
      nodeVersion: info.nodeVersion,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
