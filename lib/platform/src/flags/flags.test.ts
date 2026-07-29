import { describe, expect, it } from 'vitest';
import {
  FeatureFlagService,
  MapFlagOverrideSource,
  offInProduction,
  type FlagDefinition,
} from './index.js';

const definitions: Readonly<Record<string, FlagDefinition>> = {
  'test.everywhere': {
    key: 'test.everywhere',
    description: 'On in every environment.',
    expectedRemoval: 'never (fixture)',
    rules: {
      development: { enabled: true },
      test: { enabled: true },
      staging: { enabled: true },
      production: { enabled: true },
    },
  },
  'test.not-in-production': offInProduction(
    'test.not-in-production',
    'On outside production.',
    'fixture',
  ),
  'test.pilot': {
    key: 'test.pilot',
    description: 'Allowlisted organisations only.',
    expectedRemoval: 'fixture',
    rules: {
      development: { enabled: false, enabledForOrganizations: ['org-pilot'] },
      test: { enabled: false, enabledForOrganizations: ['org-pilot'] },
      staging: { enabled: false, enabledForOrganizations: ['org-pilot'] },
      production: { enabled: false, enabledForOrganizations: ['org-pilot'] },
    },
  },
  'test.half': {
    key: 'test.half',
    description: 'Fifty percent rollout.',
    expectedRemoval: 'fixture',
    rules: {
      development: { enabled: true, percentage: 50 },
      test: { enabled: true, percentage: 50 },
      staging: { enabled: true, percentage: 50 },
      production: { enabled: true, percentage: 50 },
    },
  },
};

describe('environment rules', () => {
  it('resolves per environment', () => {
    const production = new FeatureFlagService('production', definitions);
    const staging = new FeatureFlagService('staging', definitions);

    expect(production.isEnabled('test.not-in-production')).toBe(false);
    expect(staging.isEnabled('test.not-in-production')).toBe(true);
    expect(production.isEnabled('test.everywhere')).toBe(true);
  });
});

describe('undeclared flags', () => {
  it('throws rather than evaluating to false', () => {
    const service = new FeatureFlagService('production', definitions);

    // A typo that silently returns false means the feature never ships and
    // nobody finds out, so this has to be loud.
    expect(() => service.isEnabled('test.typo')).toThrowError(
      /Unknown feature flag/,
    );
  });
});

describe('organisation allowlists', () => {
  it('enables for a named organisation only', () => {
    const service = new FeatureFlagService('production', definitions);

    expect(
      service.isEnabled('test.pilot', { organizationId: 'org-pilot' }),
    ).toBe(true);
    expect(
      service.isEnabled('test.pilot', { organizationId: 'org-other' }),
    ).toBe(false);
    expect(service.isEnabled('test.pilot')).toBe(false);
  });
});

describe('percentage rollout', () => {
  it('is stable for the same organisation', () => {
    const service = new FeatureFlagService('production', definitions);
    const first = service.isEnabled('test.half', { organizationId: 'org-7' });

    for (let attempt = 0; attempt < 25; attempt += 1) {
      expect(service.isEnabled('test.half', { organizationId: 'org-7' })).toBe(
        first,
      );
    }
  });

  it('bucket varies across organisations', () => {
    const service = new FeatureFlagService('production', definitions);
    const results = new Set(
      Array.from({ length: 40 }, (_, index) =>
        service.isEnabled('test.half', { organizationId: `org-${index}` }),
      ),
    );

    // A 50% rollout that put every tenant in the same bucket would not be a
    // rollout at all.
    expect(results.size).toBe(2);
  });

  it('fails closed without an organisation', () => {
    const service = new FeatureFlagService('production', definitions);

    // No stable bucket means the answer would flicker between requests, so a
    // partial rollout has to be off rather than random.
    expect(service.isEnabled('test.half')).toBe(false);
  });
});

describe('overrides', () => {
  it('take precedence over the static rule', () => {
    const service = new FeatureFlagService(
      'production',
      definitions,
      new MapFlagOverrideSource(new Map([['test.not-in-production', true]])),
    );

    expect(service.isEnabled('test.not-in-production')).toBe(true);
  });

  it('can force a flag off', () => {
    const service = new FeatureFlagService(
      'production',
      definitions,
      new MapFlagOverrideSource(new Map([['test.everywhere', false]])),
    );

    expect(service.isEnabled('test.everywhere')).toBe(false);
  });

  it('do not introduce undeclared flags', () => {
    const service = new FeatureFlagService(
      'production',
      definitions,
      new MapFlagOverrideSource(new Map([['test.smuggled', true]])),
    );

    // An override is a change to a declared flag's value, never a new flag.
    expect(() => service.isEnabled('test.smuggled')).toThrowError(
      /Unknown feature flag/,
    );
  });
});

describe('snapshot', () => {
  it('reports every declared flag', () => {
    const service = new FeatureFlagService('production', definitions);
    const snapshot = service.snapshot({ organizationId: 'org-pilot' });

    expect(Object.keys(snapshot).sort()).toEqual(
      Object.keys(definitions).sort(),
    );
    expect(snapshot['test.pilot']).toBe(true);
  });
});

describe('flag hygiene', () => {
  it('requires a description and a removal plan', () => {
    for (const definition of Object.values(definitions)) {
      // An undocumented permanent flag is an untested configuration branch.
      expect(definition.description.trim()).not.toBe('');
      expect(definition.expectedRemoval.trim()).not.toBe('');
    }
  });
});
