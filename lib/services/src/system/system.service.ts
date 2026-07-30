/** Overall health status exposed by readiness endpoints. */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/** Metadata returned by health and readiness probes. */
export interface SystemHealthMetadata {
  readonly status: HealthStatus;
  readonly timestamp: Date;
  readonly version: string;
  readonly environment: string;
  readonly uptimeSeconds: number;
  readonly service: string;
}

/** Version information for diagnostics and support screens. */
export interface SystemVersionInfo {
  readonly version: string;
  readonly environment: string;
  readonly buildSha: string | null;
  readonly buildTime: Date | null;
  readonly nodeVersion: string;
}

export interface SystemServiceConfig {
  readonly serviceName?: string;
  readonly version: string;
  readonly environment: string;
  readonly buildSha?: string | null;
  readonly buildTime?: Date | null;
  readonly startedAt?: Date;
}

/**
 * Exposes platform health and version metadata.
 *
 * Does not perform deep dependency checks — those belong in the API server's
 * readiness handler once database connectivity probes are wired.
 */
export class SystemService {
  private readonly serviceName: string;
  private readonly version: string;
  private readonly environment: string;
  private readonly buildSha: string | null;
  private readonly buildTime: Date | null;
  private readonly startedAt: Date;

  constructor(config: SystemServiceConfig) {
    this.serviceName = config.serviceName ?? 'ckbhse-platform';
    this.version = config.version;
    this.environment = config.environment;
    this.buildSha = config.buildSha ?? null;
    this.buildTime = config.buildTime ?? null;
    this.startedAt = config.startedAt ?? new Date();
  }

  getHealth(status: HealthStatus = 'healthy'): SystemHealthMetadata {
    const uptimeSeconds = Math.floor(
      (Date.now() - this.startedAt.getTime()) / 1000,
    );

    return {
      status,
      timestamp: new Date(),
      version: this.version,
      environment: this.environment,
      uptimeSeconds,
      service: this.serviceName,
    };
  }

  getVersionInfo(): SystemVersionInfo {
    return {
      version: this.version,
      environment: this.environment,
      buildSha: this.buildSha,
      buildTime: this.buildTime,
      nodeVersion: process.version,
    };
  }
}
