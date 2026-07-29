import pino, { type Logger as PinoLogger } from 'pino';
import type {
  LogChannel,
  LogContext,
  LogLevel,
  Logger,
  LoggerFactory,
} from '@workspace/platform/logging';
import { logConfig } from '../config';

/**
 * Structured logging, split by channel.
 *
 * The four channels have genuinely different audiences and retention needs, so
 * they are tagged at emission rather than separated later by grepping message
 * text. `channel: "security"` is what makes "every access denial this week"
 * a query instead of an investigation.
 */

export const logger: PinoLogger = pino({
  level: logConfig.level,
  // Redaction is defence in depth: these should never be logged deliberately,
  // but a serialiser change or a new middleware can start including them.
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    "res.headers['set-cookie']",
    'password',
    'token',
    '*.password',
    '*.token',
    '*.secret',
  ],
  ...(logConfig.pretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : {}),
});

/** Adapts Pino to the platform's transport-agnostic `Logger` interface. */
class PinoLoggerAdapter implements Logger {
  constructor(private readonly inner: PinoLogger) {}

  child(context: LogContext): Logger {
    return new PinoLoggerAdapter(this.inner.child(context));
  }

  log(level: LogLevel, context: LogContext, message: string): void {
    this.inner[level](context, message);
  }

  trace(context: LogContext, message: string): void {
    this.inner.trace(context, message);
  }
  debug(context: LogContext, message: string): void {
    this.inner.debug(context, message);
  }
  info(context: LogContext, message: string): void {
    this.inner.info(context, message);
  }
  warn(context: LogContext, message: string): void {
    this.inner.warn(context, message);
  }
  error(context: LogContext, message: string): void {
    this.inner.error(context, message);
  }
  fatal(context: LogContext, message: string): void {
    this.inner.fatal(context, message);
  }
}

/**
 * One logger per channel, created once. Channel loggers are long-lived and
 * cheap to reuse, and creating them per request would lose that.
 */
class PinoLoggerFactory implements LoggerFactory {
  private readonly byChannel = new Map<LogChannel, Logger>();

  constructor(private readonly root: PinoLogger) {}

  forChannel(channel: LogChannel): Logger {
    const existing = this.byChannel.get(channel);
    if (existing) return existing;

    const created = new PinoLoggerAdapter(this.root.child({ channel }));
    this.byChannel.set(channel, created);
    return created;
  }
}

export const loggerFactory: LoggerFactory = new PinoLoggerFactory(logger);

export const appLogger: Logger = loggerFactory.forChannel('app');
export const securityLogger: Logger = loggerFactory.forChannel('security');
export const auditLogger: Logger = loggerFactory.forChannel('audit');
export const performanceLogger: Logger =
  loggerFactory.forChannel('performance');
