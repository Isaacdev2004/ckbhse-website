import app from './app';
import { logger } from './lib/logger';
import { env } from './config/env';
import { beginShutdown } from './lib/lifecycle';

const server = app.listen(env.PORT, (err) => {
  if (err) {
    logger.error({ err }, 'Error listening on port');
    process.exit(1);
  }

  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Server listening');
});

// Autoscale deployments replace instances routinely, so in-flight requests must
// be allowed to finish. /readyz starts failing first so the load balancer stops
// sending new traffic before the listener closes.
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  beginShutdown();

  const timer = setTimeout(() => {
    logger.error(
      { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
      'Forcing exit, connections did not drain in time',
    );
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);

  timer.unref();

  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => shutdown(signal));
}

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception, exiting');
  process.exit(1);
});
