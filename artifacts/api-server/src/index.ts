import app from './app';
import { logger } from './lib/logger';
import { configSummary, serverConfig } from './config';
import { beginShutdown } from './lib/lifecycle';
import {
  startBackgroundWorkers,
  stopBackgroundWorkers,
} from './container';

const server = app.listen(serverConfig.port, (err) => {
  if (err) {
    logger.error({ err }, 'Error listening on port');
    process.exit(1);
  }

  // The redacted config summary is logged at startup so that a misconfigured
  // deployment is diagnosable from the first log line rather than by reproducing
  // the symptom.
  logger.info(configSummary(), 'Server listening');
  startBackgroundWorkers();
});

// Autoscale deployments replace instances routinely, so in-flight requests must
// be allowed to finish. /readyz starts failing first so the load balancer stops
// sending new traffic before the listener closes.
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  beginShutdown();

  const timer = setTimeout(() => {
    logger.error(
      { timeoutMs: serverConfig.shutdownTimeoutMs },
      'Forcing exit, connections did not drain in time',
    );
    process.exit(1);
  }, serverConfig.shutdownTimeoutMs);

  timer.unref();

  void stopBackgroundWorkers().finally(() => {
    server.close((err) => {
      if (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }

      logger.info('Shutdown complete');
      process.exit(0);
    });
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
