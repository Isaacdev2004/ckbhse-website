/**
 * These tests pin the security guarantees of the repository layer.
 *
 * They matter more than most: a regression here does not fail loudly, it quietly
 * shows one client another client's compliance records. The in-memory store lets
 * every case run without a database, and the same cases will hold when the
 * Drizzle store replaces it.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { AppError } from '../errors/index.js';
import { PERMISSIONS, type Permission } from '../permissions/index.js';
import {
  asOrganizationId,
  asSessionId,
  asUserId,
  createSystemContext,
  createUserContext,
  type AuthorizationContext,
} from '../authorization/index.js';
import { AuditRecorder, InMemoryAuditSink } from '../audit/index.js';
import { toOffsetPage, toCursorPage } from '../search/index.js';
import { BaseRepository } from './base.js';
import { InMemoryEntityStore } from './in-memory.js';
import { auditHooks } from './audit-hooks.js';
import type { RepositoryDefinition } from './types.js';

// --- A representative entity: tenant-scoped and soft-deletable ---------------

interface Finding {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly severity: number;
  readonly deletedAt: Date | null;
  readonly secret?: string;
}

const definition: RepositoryDefinition<Finding> = {
  name: 'Finding',
  tenantScoped: true,
  softDeletable: true,
};

class FindingRepository extends BaseRepository<Finding> {
  createFinding(
    context: AuthorizationContext,
    input: { id: string; title: string; severity: number },
  ): Promise<Finding> {
    return this.insert(context, {
      id: input.id,
      // Deliberately wrong: the base class must overwrite this with the caller's
      // real tenant. See the "cannot write into another tenant" test.
      organizationId: 'attacker-supplied',
      title: input.title,
      severity: input.severity,
      deletedAt: null,
    });
  }

  rename(
    context: AuthorizationContext,
    id: string,
    title: string,
  ): Promise<Finding> {
    return this.mutate(context, id, (current) => ({ ...current, title }));
  }
}

const ORG_A = asOrganizationId('org-a');
const ORG_B = asOrganizationId('org-b');

function contextFor(
  organizationId = ORG_A,
  permissions: readonly Permission[] = [
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_CONDUCT,
  ],
): AuthorizationContext {
  return createUserContext({
    userId: asUserId(`user-of-${organizationId}`),
    organizationId,
    sessionId: asSessionId('session-1'),
    roles: ['consultant'],
    permissions,
    metadata: {
      requestId: 'req-1',
      ipAddress: '198.51.100.7',
      userAgent: 'vitest',
    },
  });
}

interface Harness {
  repository: FindingRepository;
  store: InMemoryEntityStore<Finding>;
  sink: InMemoryAuditSink;
}

function harness(seed: readonly Finding[] = []): Harness {
  const store = new InMemoryEntityStore<Finding>(seed);
  const sink = new InMemoryAuditSink();

  const repository = new FindingRepository({
    definition,
    store,
    permissions: {
      read: PERMISSIONS.AUDIT_READ,
      write: PERMISSIONS.AUDIT_CONDUCT,
    },
    hooks: auditHooks(new AuditRecorder(sink), definition),
  });

  return { repository, store, sink };
}

function finding(overrides: Partial<Finding> & { id: string }): Finding {
  return {
    organizationId: ORG_A,
    title: 'Missing extinguisher signage',
    severity: 2,
    deletedAt: null,
    ...overrides,
  };
}

// --- Tenant isolation --------------------------------------------------------

describe('tenant isolation', () => {
  let h: Harness;

  beforeEach(() => {
    h = harness([
      finding({ id: 'a1', organizationId: ORG_A }),
      finding({ id: 'b1', organizationId: ORG_B }),
    ]);
  });

  it('does not return another tenant\u2019s record by id', async () => {
    expect(await h.repository.findById(contextFor(ORG_A), 'b1')).toBeNull();
  });

  it('reports 404 rather than 403 for another tenant\u2019s record', async () => {
    // The distinction matters: 403 would confirm the id exists, turning the
    // endpoint into an existence oracle across tenant boundaries.
    await expect(
      h.repository.findByIdOrFail(contextFor(ORG_A), 'b1'),
    ).rejects.toMatchObject({ code: 'not_found' });
  });

  it('lists only the caller\u2019s own tenant', async () => {
    const page = await h.repository.list(contextFor(ORG_A), {
      page: toOffsetPage(),
    });

    expect(page.items.map((item) => item.id)).toEqual(['a1']);
  });

  it('scopes each tenant independently', async () => {
    const page = await h.repository.list(contextFor(ORG_B), {
      page: toOffsetPage(),
    });

    expect(page.items.map((item) => item.id)).toEqual(['b1']);
  });

  it('cannot write into another tenant even when the input says so', async () => {
    const created = await h.repository.createFinding(contextFor(ORG_A), {
      id: 'new-1',
      title: 'Blocked fire door',
      severity: 4,
    });

    // The repository stamped the tenant from the context, discarding the
    // 'attacker-supplied' value the entity carried.
    expect(created.organizationId).toBe(ORG_A);
  });

  it('fails closed when a permitted context carries no organisation', async () => {
    // A context that passes the permission check but has no tenant must not fall
    // through to an unscoped query. This is the shape a session-parsing bug would
    // produce, and querying every tenant would be the worst possible response.
    const tenantless: AuthorizationContext = {
      actorKind: 'user',
      userId: asUserId('u1'),
      roles: [],
      permissions: new Set([PERMISSIONS.AUDIT_READ]),
      metadata: { requestId: 'req-2' },
    };

    await expect(
      h.repository.list(tenantless, { page: toOffsetPage() }),
    ).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('allows a deliberate cross-tenant read only with the platform permission', async () => {
    const auditor = contextFor(ORG_A, [
      PERMISSIONS.AUDIT_READ,
      PERMISSIONS.TENANT_VIEW_ALL,
    ]);

    // Scoped listing still narrows to the caller's own tenant...
    const page = await h.repository.list(auditor, { page: toOffsetPage() });
    expect(page.items.map((item) => item.id)).toEqual(['a1']);

    // ...but a direct lookup by id is permitted, which is the audited exception.
    expect(await h.repository.findById(auditor, 'b1')).not.toBeNull();
  });

  it('bypasses tenant scoping for a system context', async () => {
    const system = createSystemContext(
      { requestId: 'job-1' },
      'nightly compliance rollup',
    );

    const page = await h.repository.list(
      { ...system, permissions: new Set([PERMISSIONS.AUDIT_READ]) },
      { page: toOffsetPage() },
    );

    expect(page.items.map((item) => item.id).sort()).toEqual(['a1', 'b1']);
  });
});

// --- Permissions -------------------------------------------------------------

describe('permission enforcement', () => {
  it('denies a read without the read permission', async () => {
    const h = harness([finding({ id: 'a1' })]);

    await expect(
      h.repository.findById(contextFor(ORG_A, []), 'a1'),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('denies a write with only the read permission', async () => {
    const h = harness();

    await expect(
      h.repository.createFinding(contextFor(ORG_A, [PERMISSIONS.AUDIT_READ]), {
        id: 'x',
        title: 'x',
        severity: 1,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('returns 401 rather than 403 for an anonymous caller', async () => {
    const h = harness();
    const anonymous: AuthorizationContext = {
      actorKind: 'anonymous',
      roles: [],
      permissions: new Set(),
      metadata: { requestId: 'req-anon' },
    };

    // Retrying with the same (absent) credentials cannot help, so the client
    // needs to be told to authenticate rather than that it is forbidden.
    await expect(h.repository.findById(anonymous, 'a1')).rejects.toMatchObject({
      code: 'unauthorized',
    });
  });
});

// --- Soft deletion -----------------------------------------------------------

describe('soft deletion', () => {
  it('hides a deleted record but retains the row', async () => {
    const h = harness([finding({ id: 'a1' })]);
    const context = contextFor();

    await h.repository.delete(context, 'a1');

    expect(await h.repository.findById(context, 'a1')).toBeNull();
    // The row survives, because a finding referenced by an issued report must
    // remain reconstructible.
    expect(h.store.size).toBe(1);
  });

  it('excludes deleted records from listings', async () => {
    const h = harness([finding({ id: 'a1' }), finding({ id: 'a2' })]);
    const context = contextFor();

    await h.repository.delete(context, 'a1');
    const page = await h.repository.list(context, { page: toOffsetPage() });

    expect(page.items.map((item) => item.id)).toEqual(['a2']);
  });

  it('requires the delete permission to view deleted records', async () => {
    const h = harness([finding({ id: 'a1' })]);

    await expect(
      h.repository.list(contextFor(ORG_A, [PERMISSIONS.AUDIT_READ]), {
        page: toOffsetPage(),
        includeDeleted: true,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('surfaces deleted records when explicitly requested and permitted', async () => {
    const h = harness([finding({ id: 'a1' })]);
    const context = contextFor();

    await h.repository.delete(context, 'a1');
    const page = await h.repository.list(context, {
      page: toOffsetPage(),
      includeDeleted: true,
    });

    expect(page.items.map((item) => item.id)).toEqual(['a1']);
  });

  it('restores a deleted record', async () => {
    const h = harness([finding({ id: 'a1' })]);
    const context = contextFor();

    await h.repository.delete(context, 'a1');
    const restored = await h.repository.restore(context, 'a1');

    expect(restored.deletedAt).toBeNull();
    expect(await h.repository.findById(context, 'a1')).not.toBeNull();
  });

  it('cannot restore another tenant\u2019s record', async () => {
    const h = harness([finding({ id: 'b1', organizationId: ORG_B })]);

    await expect(
      h.repository.restore(contextFor(ORG_A), 'b1'),
    ).rejects.toMatchObject({ code: 'not_found' });
  });

  it('hard deletes when the entity is not soft-deletable', async () => {
    interface Reference {
      readonly id: string;
      readonly label: string;
    }

    const refDefinition: RepositoryDefinition<Reference> = {
      name: 'Reference',
      tenantScoped: false,
      softDeletable: false,
    };

    const store = new InMemoryEntityStore<Reference>([
      { id: 'r1', label: 'ISO 45001' },
    ]);

    class ReferenceRepository extends BaseRepository<Reference> {}

    const repository = new ReferenceRepository({
      definition: refDefinition,
      store,
      permissions: {
        read: PERMISSIONS.CONTENT_READ,
        write: PERMISSIONS.CONTENT_MANAGE,
      },
    });

    await repository.delete(
      contextFor(ORG_A, [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_MANAGE]),
      'r1',
    );

    expect(store.size).toBe(0);
  });
});

// --- Audit hooks -------------------------------------------------------------

describe('audit hooks', () => {
  it('records a create with the actor, tenant and request id', async () => {
    const h = harness();

    await h.repository.createFinding(contextFor(), {
      id: 'a1',
      title: 'Obstructed walkway',
      severity: 3,
    });

    expect(h.sink.events).toHaveLength(1);
    expect(h.sink.events[0]).toMatchObject({
      entity: 'Finding',
      entityId: 'a1',
      action: 'create',
      actorId: 'user-of-org-a',
      organizationId: 'org-a',
      requestId: 'req-1',
      ipAddress: '198.51.100.7',
      userAgent: 'vitest',
      previousValues: null,
    });
  });

  it('records only the fields an update changed', async () => {
    const h = harness([finding({ id: 'a1', title: 'Before' })]);

    await h.repository.rename(contextFor(), 'a1', 'After');

    const [event] = h.sink
      .eventsFor('Finding', 'a1')
      .filter((candidate) => candidate.action === 'update');

    expect(event?.previousValues).toEqual({ title: 'Before' });
    expect(event?.newValues).toEqual({ title: 'After' });
  });

  it('redacts secrets from recorded values', async () => {
    const h = harness([
      finding({ id: 'a1', title: 'Before', secret: 'hunter2' }),
    ]);

    await h.repository.rename(contextFor(), 'a1', 'After');

    const serialised = JSON.stringify(h.sink.events);
    expect(serialised).not.toContain('hunter2');
  });

  it('records a delete as a delete rather than a field update', async () => {
    const h = harness([finding({ id: 'a1' })]);

    await h.repository.delete(contextFor(), 'a1');

    // "Who removed this, and when" must be answerable without diffing fields.
    expect(h.sink.events.map((event) => event.action)).toEqual(['delete']);
  });

  it('records a restore', async () => {
    const h = harness([finding({ id: 'a1' })]);
    const context = contextFor();

    await h.repository.delete(context, 'a1');
    await h.repository.restore(context, 'a1');

    expect(h.sink.events.map((event) => event.action)).toEqual([
      'delete',
      'restore',
    ]);
  });

  it('does not record an audit event for a denied operation', async () => {
    const h = harness([finding({ id: 'a1' })]);

    await expect(
      h.repository.rename(
        contextFor(ORG_A, [PERMISSIONS.AUDIT_READ]),
        'a1',
        'x',
      ),
    ).rejects.toBeInstanceOf(AppError);

    expect(h.sink.events).toHaveLength(0);
  });
});

// --- Pagination --------------------------------------------------------------

describe('pagination', () => {
  const seed = Array.from({ length: 7 }, (_, index) =>
    finding({ id: `a${index + 1}`, severity: index + 1 }),
  );

  it('returns an offset window with a total', async () => {
    const h = harness(seed);

    const page = await h.repository.list(contextFor(), {
      page: toOffsetPage({ limit: 3, offset: 3 }),
      sort: { field: 'severity', direction: 'asc' },
    });

    expect(page.items.map((item) => item.id)).toEqual(['a4', 'a5', 'a6']);
    expect(page.hasMore).toBe(true);
    expect(page.total).toBe(7);
  });

  it('walks pages with a cursor without repeating items', async () => {
    const h = harness(seed);
    const context = contextFor();
    const seen: string[] = [];
    let cursor: string | undefined;

    do {
      const page = await h.repository.list(context, {
        page: toCursorPage(
          cursor !== undefined ? { limit: 3, cursor } : { limit: 3 },
        ),
        sort: { field: 'severity', direction: 'asc' },
      });

      seen.push(...page.items.map((item) => item.id));
      cursor = page.nextCursor;
    } while (cursor !== undefined);

    expect(seen).toEqual(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']);
  });

  it('reports the final page as having no more results', async () => {
    const h = harness(seed);

    const page = await h.repository.list(contextFor(), {
      page: toOffsetPage({ limit: 10 }),
    });

    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeUndefined();
  });

  it('rejects a stale cursor rather than silently restarting', async () => {
    const h = harness(seed);

    await expect(
      h.repository.list(contextFor(), {
        page: toCursorPage({ cursor: 'no-such-id' }),
      }),
    ).rejects.toMatchObject({ code: 'bad_request' });
  });
});
