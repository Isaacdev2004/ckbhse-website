/**
 * Wires the audit recorder into the repository layer.
 *
 * This is the join that makes "every mutating operation is audited" structural
 * rather than aspirational: a repository constructed with these hooks emits an
 * audit event for every create, update, delete and restore, and the call site
 * cannot forget to because it is never asked.
 *
 * Only changed fields are recorded, and secrets are redacted, by delegating to
 * `diffAuditValues`.
 */

import type { AuthorizationContext } from '../authorization/index.js';
import { diffAuditValues, type AuditRecorder } from '../audit/index.js';
import type {
  Entity,
  RepositoryDefinition,
  RepositoryHooks,
  RepositoryMutation,
} from './types.js';

export function auditHooks<T extends Entity>(
  recorder: AuditRecorder,
  definition: RepositoryDefinition<T>,
): RepositoryHooks<T> {
  const ignored = new Set<string>(definition.auditIgnoredFields ?? []);

  return {
    async afterMutation(
      context: AuthorizationContext,
      mutation: RepositoryMutation<T>,
    ): Promise<void> {
      const { previousValues, newValues } = diffAuditValues(
        toRecord(mutation.previous, ignored),
        toRecord(mutation.next, ignored),
      );

      // A no-op update (a PATCH that changed nothing) produces no diff. Record
      // it anyway: "someone submitted this change and it did nothing" is exactly
      // the sort of thing an investigation needs, and an audit log with holes in
      // it is not evidence.
      await recorder.record(context, {
        entity: mutation.entity,
        entityId: mutation.entityId,
        action: mutation.action,
        previousValues,
        newValues,
      });
    },
  };
}

function toRecord<T extends Entity>(
  entity: T | null,
  ignored: ReadonlySet<string>,
): Record<string, unknown> | null {
  if (entity === null) return null;

  const record: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entity)) {
    if (!ignored.has(key)) {
      record[key] = value;
    }
  }

  return record;
}
