import { FeatureFlagRepository } from '@workspace/data/repositories/feature-flag';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import {
  FeatureFlagService as PlatformFeatureFlagService,
  FEATURE_FLAGS,
  type Environment,
  type FlagDefinition,
  type FlagEvaluationContext,
} from '@workspace/platform/flags';

/**
 * Application feature flag service with database override support.
 *
 * Static flag definitions remain in code for reviewability; runtime overrides
 * from the data layer are refreshed explicitly before evaluation in long-lived
 * processes.
 */
export class FeatureFlagService {
  private readonly repository: FeatureFlagRepository;
  private readonly inner: PlatformFeatureFlagService;

  constructor(
    environment: Environment,
    repository: FeatureFlagRepository,
    definitions: Readonly<Record<string, FlagDefinition>> = FEATURE_FLAGS,
  ) {
    this.repository = repository;
    this.inner = new PlatformFeatureFlagService(
      environment,
      definitions,
      repository,
    );
  }

  /** Reload overrides from the database into memory. */
  refresh(organizationId?: string): Promise<void> {
    return this.repository.refresh(organizationId);
  }

  isEnabled(key: string, context: FlagEvaluationContext = {}): boolean {
    return this.inner.isEnabled(key, context);
  }

  isEnabledFor(key: string, context: AuthorizationContext): boolean {
    return this.inner.isEnabledFor(key, context);
  }

  snapshot(
    context: FlagEvaluationContext = {},
  ): Readonly<Record<string, boolean>> {
    return this.inner.snapshot(context);
  }

  definition(key: string) {
    return this.inner.definition(key);
  }

  get keys(): readonly string[] {
    return this.inner.keys;
  }
}
