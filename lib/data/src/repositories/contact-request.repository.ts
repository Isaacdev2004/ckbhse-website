import type { CreateContactRequestInput } from '@workspace/domain/crm';
import {
  canTransitionContactRequestStatus,
  validateContactRequestInput,
} from '@workspace/domain/crm';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import {
  auditHooks,
  BaseRepository,
  type BaseRepositoryOptions,
  type RepositoryDefinition,
} from '@workspace/platform/repository';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import {
  CONTACT_REQUEST_DEFINITION,
  fromCreateInput,
  type ContactRequestEntity,
} from '../mappers/contact-request.mapper.js';
import type { ContactRequestStatus } from '@workspace/domain/crm';

export { CONTACT_REQUEST_DEFINITION };
export type { ContactRequestEntity };

const definition: RepositoryDefinition<ContactRequestEntity> =
  CONTACT_REQUEST_DEFINITION;

export interface ContactRequestRepositoryOptions
  extends Omit<
    BaseRepositoryOptions<ContactRequestEntity>,
    'definition' | 'permissions'
  > {}

export class ContactRequestRepository extends BaseRepository<ContactRequestEntity> {
  constructor(options: ContactRequestRepositoryOptions) {
    super({
      definition,
      permissions: {
        read: PERMISSIONS.ENQUIRY_READ,
        write: PERMISSIONS.ENQUIRY_MANAGE,
      },
      ...options,
    });
  }

  create(
    context: AuthorizationContext,
    input: CreateContactRequestInput,
  ): Promise<ContactRequestEntity> {
    validateContactRequestInput(input);

    return this.insert(
      context,
      fromCreateInput(crypto.randomUUID(), '', input),
    );
  }

  /**
   * Creates a website enquiry under a trusted system context.
   *
   * Public submissions bypass permission checks because no user session exists.
   * The caller must supply the platform operator organisation id and perform
   * audit/outbox writes in the same transaction as the insert.
   */
  async createPublicEnquiry(
    context: AuthorizationContext,
    organizationId: string,
    input: CreateContactRequestInput,
  ): Promise<ContactRequestEntity> {
    if (context.actorKind !== 'system') {
      throw AppError.forbidden(
        'Public enquiry submission requires a system authorization context',
      );
    }

    validateContactRequestInput(input);

    const entity = fromCreateInput(
      crypto.randomUUID(),
      organizationId,
      input,
    );

    return this.store.insert(entity);
  }

  transitionStatus(
    context: AuthorizationContext,
    id: string,
    status: ContactRequestStatus,
  ): Promise<ContactRequestEntity> {
    return this.mutate(context, id, (current) => {
      if (!canTransitionContactRequestStatus(current.status, status)) {
        throw AppError.badRequest(
          `ContactRequest cannot transition from ${current.status} to ${status}`,
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
  ): Promise<ContactRequestEntity> {
    return this.mutate(context, id, (current) => ({
      ...current,
      assignedToUserId: userId,
      status: current.status === 'received' ? 'assigned' : current.status,
      updatedAt: new Date(),
      version: current.version + 1,
    }));
  }

  async transitionStatusSystem(
    context: AuthorizationContext,
    id: string,
    status: ContactRequestStatus,
  ): Promise<ContactRequestEntity> {
    if (context.actorKind !== 'system') {
      throw AppError.forbidden(
        'System contact status transition requires a system authorization context',
      );
    }

    const current = await this.store.get(id);
    if (current === null) {
      throw AppError.notFound('ContactRequest not found');
    }

    if (!canTransitionContactRequestStatus(current.status, status)) {
      throw AppError.badRequest(
        `ContactRequest cannot transition from ${current.status} to ${status}`,
      );
    }

    return this.store.replace({
      ...current,
      status,
      updatedAt: new Date(),
      version: current.version + 1,
    });
  }
}

export function createContactRequestRepository(
  options: ContactRequestRepositoryOptions,
): ContactRequestRepository {
  return new ContactRequestRepository(options);
}

export { auditHooks };
