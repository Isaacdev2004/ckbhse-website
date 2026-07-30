import { Router, type IRouter } from 'express';
import { HealthCheckResponse } from '@workspace/api-zod';

const router: IRouter = Router();

/** Versioned liveness probe — mirrors `/api/healthz` under the v1 namespace. */
router.get('/', (_req, res) => {
  const data = HealthCheckResponse.parse({ status: 'ok' });
  res.json(data);
});

export default router;
