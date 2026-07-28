import { Router, type IRouter } from 'express';
import {
  HealthCheckResponse,
  ReadinessCheckResponse,
} from '@workspace/api-zod';
import { isShuttingDown } from '../lib/lifecycle';

const router: IRouter = Router();

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
 * graceful shutdown so the load balancer drains it before the process exits.
 */
router.get('/readyz', (_req, res) => {
  if (isShuttingDown()) {
    res
      .status(503)
      .json(ReadinessCheckResponse.parse({ status: 'shutting_down' }));
    return;
  }

  res.json(ReadinessCheckResponse.parse({ status: 'ready' }));
});

export default router;
