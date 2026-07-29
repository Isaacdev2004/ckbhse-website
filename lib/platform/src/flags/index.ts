/**
 * Feature flags.
 *
 * Document 05 relies on flags to keep trunk-based development viable: incomplete
 * work merges behind a flag that is off in production rather than living on a
 * branch. That only works if the flag system has two properties, both enforced
 * here:
 *
 *  - A flag must be *declared* to be used. An undeclared flag evaluates to a hard
 *    error, not to false, because a silently-false flag from a typo means the
 *    feature simply never ships and no one finds out.
 *  - Evaluation is deterministic and pure. Given the same flag, environment and
 *    context, the answer never changes within a request, so a user cannot see a
 *    feature appear and disappear between two calls on the same page.
 */

import { AppError } from '../errors/index.js';
import type { AuthorizationContext } from '../authorization/index.js';

export type Environment = 'development' | 'test' | 'staging' | 'production';

/**
 * Per-environment state.
 *
 * `enabledForOrganizations` is an allowlist for staged rollout to named client
 * organisations, which is how a feature reaches a pilot customer without a
 * separate deployment.
 */
export interface FlagRule {
  readonly enabled: boolean;
  readonly enabledForOrganizations?: readonly string[];
  /**
   * Percentage rollout, 0-100. Bucketed by organisation so a client sees a
   * consistent experience across all of their users, rather than a feature that
   * varies between colleagues in the same meeting.
   */
  readonly percentage?: number;
}

export interface FlagDefinition {
  readonly key: string;
  readonly description: string;
  /**
   * When this flag should be removed. Flags are temporary by design; an
   * undocumented permanent flag is a configuration branch that never gets tested.
   */
  readonly expectedRemoval: string;
  readonly rules: Readonly<Record<Environment, FlagRule>>;
}

const OFF: FlagRule = { enabled: false };
const ON: FlagRule = { enabled: true };

/**
 * Convenience builder for the common case: on everywhere except production.
 */
export function offInProduction(
  key: string,
  description: string,
  expectedRemoval: string,
): FlagDefinition {
  return {
    key,
    description,
    expectedRemoval,
    rules: {
      development: ON,
      test: ON,
      staging: ON,
      production: OFF,
    },
  };
}

/**
 * The flag catalogue.
 *
 * Declared in code for the same reason as the permission catalogue: it is
 * reviewable, diffable and typo-proof. Runtime overrides (a database table, an
 * external service) layer on top of this via `FlagOverrideSource` — they never
 * introduce flags that are not declared here.
 *
 * Empty by design. This is a foundation phase with no incomplete features to
 * hide, and a placeholder flag with no consumer would be exactly the untested
 * configuration branch the expiry field exists to prevent. The first entry
 * arrives with the first feature that merges before it is finished; the framework
 * itself is exercised against fixture definitions in `flags.test.ts`.
 */
export const FEATURE_FLAGS: Readonly<Record<string, FlagDefinition>> =
  Object.freeze({});

export interface FlagEvaluationContext {
  readonly organizationId?: string;
}

/** A runtime override, checked before the static rules. */
export interface FlagOverrideSource {
  /** Undefined means "no opinion"; the static rule then applies. */
  get(key: string): boolean | undefined;
}

export class FeatureFlagService {
  private readonly definitions: Readonly<Record<string, FlagDefinition>>;

  constructor(
    private readonly environment: Environment,
    definitions: Readonly<Record<string, FlagDefinition>> = FEATURE_FLAGS,
    private readonly overrides?: FlagOverrideSource,
  ) {
    this.definitions = definitions;
  }

  get keys(): readonly string[] {
    return Object.keys(this.definitions);
  }

  definition(key: string): FlagDefinition {
    const definition = this.definitions[key];
    if (definition === undefined) {
      throw AppError.internal(
        `Unknown feature flag: ${key}. Declare it in FEATURE_FLAGS first.`,
      );
    }
    return definition;
  }

  isEnabled(key: string, context: FlagEvaluationContext = {}): boolean {
    const definition = this.definition(key);

    const override = this.overrides?.get(key);
    if (override !== undefined) return override;

    const rule = definition.rules[this.environment];

    if (rule.enabledForOrganizations && context.organizationId !== undefined) {
      if (rule.enabledForOrganizations.includes(context.organizationId)) {
        return true;
      }
    }

    if (!rule.enabled) return false;

    if (rule.percentage !== undefined && rule.percentage < 100) {
      // No organisation means no stable bucket, so a partial rollout has to fail
      // closed rather than flicker per request.
      if (context.organizationId === undefined) return false;
      return bucketOf(key, context.organizationId) < rule.percentage;
    }

    return true;
  }

  /** Evaluate for a request. Convenience over threading the tenant manually. */
  isEnabledFor(key: string, context: AuthorizationContext): boolean {
    return this.isEnabled(
      key,
      context.organizationId !== undefined
        ? { organizationId: context.organizationId }
        : {},
    );
  }

  /** Snapshot of every flag, for diagnostics and staff-facing screens. */
  snapshot(
    context: FlagEvaluationContext = {},
  ): Readonly<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    for (const key of this.keys) {
      result[key] = this.isEnabled(key, context);
    }
    return result;
  }
}

/**
 * Stable bucket in [0, 100) derived from the flag key and organisation.
 *
 * Keyed on both so that two flags at 10% do not select the same tenants, which
 * would concentrate all early exposure on one unlucky customer.
 */
function bucketOf(key: string, organizationId: string): number {
  const input = `${key}:${organizationId}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash) % 100;
}

/** Reads overrides from a plain map. For tests and local development. */
export class MapFlagOverrideSource implements FlagOverrideSource {
  constructor(private readonly values: ReadonlyMap<string, boolean>) {}

  get(key: string): boolean | undefined {
    return this.values.get(key);
  }
}
