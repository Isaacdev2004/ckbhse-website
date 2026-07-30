import type { CreateLeadFromContactInput } from '@workspace/domain/crm';
import {
  canTransitionLeadStatus,
} from '@workspace/domain/crm';
import type { LeadStatus } from '@workspace/domain/crm';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import {
  auditHooks,
  BaseRepository,
  paginate,
  type BaseRepositoryOptions,
  type RepositoryDefinition,
} from '@workspace/platform/repository';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import type { Page, PageRequest } from '@workspace/platform/search';
import {
  fromContactRequestInput,
  LEAD_DEFINITION,
  type LeadEntity,
} from '../mappers/lead.mapper.js';
import type {
  LeadEntityStore,
  LeadSearchFilters,
} from '../stores/drizzle-lead.store.js';

export { LEAD_DEFINITION };
export type { LeadEntity, LeadSearchFilters };

const definition: RepositoryDefinition<LeadEntity> = LEAD_DEFINITION;

export interface LeadRepositoryOptions
  extends Omit<
    BaseRepositoryOptions<LeadEntity>,
    'definition' | 'permissions' | 'store'
  > {
  readonly store: LeadEntityStore;
}

export class LeadRepository extends BaseRepository<LeadEntity> {
  private readonly leadStore: LeadEntityStore;

  constructor(options: LeadRepositoryOptions) {
    super({
      definition,
      permissions: {
        read: PERMISSIONS.LEAD_READ,
        write: PERMISSIONS.LEAD_MANAGE,
      },
      ...options,
    });
    this.leadStore = options.store;
  }

  createFromContact(
    context: AuthorizationContext,
    input: CreateLeadFromContactInput,
  ): Promise<LeadEntity> {
    return this.insert(
      context,
      fromContactRequestInput(crypto.randomUUID(), input),
    );
  }

  transitionStatus(
    context: AuthorizationContext,
    id: string,
    status: LeadStatus,
  ): Promise<LeadEntity> {
    return this.mutate(context, id, (current) => {
      if (!canTransitionLeadStatus(current.status, status)) {
        throw AppError.badRequest(
          `Lead cannot transition from ${current.status} to ${status}`,
        );
      }

      return {
        ...current,
        status,
        updatedAt: new Date(),
        version: current.version + 1,
      };
    });
  }

  assignTo(
    context: AuthorizationContext,
    id: string,
    userId: string,
  ): Promise<LeadEntity> {
    return this.mutate(context, id, (current) => ({
      ...current,
      assignedToUserId: userId,
      status: current.status === 'new' ? 'acknowledged' : current.status,
      updatedAt: new Date(),
      version: current.version + 1,
    }));
  }

  /**
   * Creates a lead from a contact enquiry under a trusted system context.
   */
  async createFromContactSystem(
    context: AuthorizationContext,
    input: CreateLeadFromContactInput,
  ): Promise<LeadEntity> {
    if (context.actorKind !== 'system') {
      throw AppError.forbidden(
        'Lead creation from contact requires a system authorization context',
      );
    }

    return this.store.insert(
      fromContactRequestInput(crypto.randomUUID(), input),
    );
  }

  async search(
    context: AuthorizationContext,
    filters: LeadSearchFilters,
    page: PageRequest,
  ): Promise<Page<LeadEntity>> {
    requirePermission(context, this.permissions.read);

    const scope = this.scopeFor(context);
    const rows = await this.leadStore.search(scope, filters);
    const sorted = this.applySort(rows, {
      page,
      sort: { field: 'createdAt', direction: 'desc' },
    });

    return paginate(sorted, page);
  }
}

export function createLeadRepository(
  options: LeadRepositoryOptions,
): LeadRepository {
  return new LeadRepository(options);
}

export { auditHooks };
