import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import router from './routes';
import { logger } from './lib/logger';
import { cookieConfig, serverConfig } from './config';
import {
  corsPolicy,
  rateLimiter,
  securityHeaders,
} from './middleware/security';
import { requestContext } from './middleware/request-context';
import { sessionAuth } from './middleware/session-auth';
import { devAuth } from './middleware/dev-auth';
import { issueCsrfToken, verifyCsrfToken } from './middleware/csrf';
import { errorHandler, notFoundHandler } from './middleware/error';

const app: Express = express();

// Behind Replit's router or any load balancer, req.ip must come from
// X-Forwarded-For or rate limiting keys every client to the proxy's address.
if (serverConfig.trustProxy) {
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

app.use(express.json({ limit: serverConfig.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: serverConfig.bodyLimit }));
app.use(cookieParser(cookieConfig.secret));

// Order matters from here down.
//
// The request context runs before anything that logs or authorises, so every
// downstream layer has a correlation id and an authorization context. CSRF
// verification runs after the cookie parser (it reads a cookie) and before the
// router, so a state-changing route is protected by default rather than by the
// author remembering to opt in.
app.use(requestContext);
app.use(sessionAuth);
app.use(devAuth);
app.use(issueCsrfToken);
app.use(verifyCsrfToken);

app.use('/api', router);

// Unmatched routes become a 404 AppError, then every error -- thrown or
// forwarded -- is serialised by the single error handler.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
