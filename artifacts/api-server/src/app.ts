import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import router from './routes';
import { logger } from './lib/logger';
import { env } from './config/env';
import {
  corsPolicy,
  rateLimiter,
  securityHeaders,
} from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/error';

const app: Express = express();

// Behind Replit's router or any load balancer, req.ip must come from
// X-Forwarded-For or rate limiting keys every client to the proxy's address.
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split('?')[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(securityHeaders);
app.use(corsPolicy);
app.use(rateLimiter);

app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));
app.use(cookieParser());

app.use('/api', router);

// Order matters: unmatched routes become a 404 ApiError, then every error --
// thrown or forwarded -- is serialised by the single error handler.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
