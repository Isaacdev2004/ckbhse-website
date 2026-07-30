import { Router, type IRouter } from 'express';
import {
  HealthCheckResponse,
  ReadinessCheckResponse,
} from '@workspace/api-zod';
import { getPool } from '@workspace/db';
import { isShuttingDown } from '../lib/lifecycle';
import { databaseConfig } from '../config';

const router: IRouter = Router();

async function probeDatabase(): Promise<boolean> {
  if (!databaseConfig.configured) {
    return true;
  }

  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Liveness: is the process up? Must not touch dependencies, or a database
 * blip would cause the orchestrator to restart otherwise-healthy instances.
 */
router.get('/healthz', (_req, res) => {
  const data = HealthCheckResponse.parse({ status: 'ok' });
  res.json(data);
});

/**
 * Readiness: should this instance receive traffic? Reports not-ready during
 * graceful shutdown or when the database is configured but unreachable.
 */
router.get('/readyz', async (_req, res) => {
  if (isShuttingDown()) {
    res
      .status(503)
      .json(ReadinessCheckResponse.parse({ status: 'shutting_down' }));
    return;
  }

  const databaseHealthy = await probeDatabase();
  if (!databaseHealthy) {
    res
      .status(503)
      .json(ReadinessCheckResponse.parse({ status: 'not_ready' }));
    return;
  }

  res.json(ReadinessCheckResponse.parse({ status: 'ready' }));
});

export default router;
