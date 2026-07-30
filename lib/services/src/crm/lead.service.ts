import type { DataLayer } from '@workspace/data';
import { toDomainLead } from '@workspace/data/mappers/lead';
import type { LeadSearchFilters } from '@workspace/data/stores/lead';
import type {
  CreateLeadFromContactInput,
  Lead,
  LeadStatus,
} from '@workspace/domain/crm';
import { asEntityId, asOrganizationId } from '@workspace/domain/shared';
import {
  createSystemContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import type { Page, PageRequest } from '@workspace/platform/search';
import type { EmailProvider } from '@workspace/platform/email';
import {
  EmailTemplateKey,
  renderTemplate,
} from '@workspace/email-templates';

import { CrmEmailService } from './crm-email.service.js';

export interface LeadServiceDeps {
  readonly dataLayer: DataLayer;
  readonly platformOrganizationId: string;
  readonly email: EmailProvider;
  readonly supportEmail?: string;
  readonly staffPortalUrl?: string;
}

export class LeadService {
  private readonly dataLayer: DataLayer;
  private readonly platformOrganizationId: string;
  private readonly crmEmail: CrmEmailService;
  private readonly staffPortalUrl: string;

  constructor(deps: LeadServiceDeps) {
    this.dataLayer = deps.dataLayer;
    this.platformOrganizationId = deps.platformOrganizationId;
    this.staffPortalUrl = deps.staffPortalUrl ?? '/staff/leads';
    this.crmEmail = new CrmEmailService({
      email: deps.email,
      supportEmail: deps.supportEmail ?? 'enquiries@ckbhse.co.uk',
    });
  }

  async search(
    context: AuthorizationContext,
    filters: LeadSearchFilters,
    page: PageRequest,
  ): Promise<Page<Lead>> {
    const result = await this.dataLayer.leadRepository.search(
      context,
      filters,
      page,
    );
    return {
      ...result,
      items: result.items.map((entity) => toDomainLead(entity)),
    };
  }

  async getById(
    context: AuthorizationContext,
    id: string,
  ): Promise<Lead | null> {
    const entity = await this.dataLayer.leadRepository.findById(context, id);
    return entity === null ? null : toDomainLead(entity);
  }

  async getByIdOrFail(context: AuthorizationContext, id: string): Promise<Lead> {
    const lead = await this.getById(context, id);
    if (lead === null) {
      throw AppError.notFound('Lead not found');
    }
    return lead;
  }

  async transitionStatus(
    context: AuthorizationContext,
    id: string,
    status: LeadStatus,
    reason?: string | null,
  ): Promise<Lead> {
    const previous = await this.dataLayer.leadRepository.findByIdOrFail(
      context,
      id,
    );

    const entity = await this.dataLayer.leadRepository.transitionStatus(
      context,
      id,
      status,
    );

    await this.dataLayer.leadStatusHistoryRepository.record(context, {
      leadId: id,
      fromStatus: previous.status,
      toStatus: status,
      changedByUserId: context.userId ?? null,
      reason: reason ?? null,
    });

    await this.dataLayer.leadActivityRepository.insert(context, {
      leadId: id,
      activityType: 'status_changed',
      title: `Status changed to ${status}`,
      description: reason ?? null,
      actorUserId: context.userId ?? null,
      metadata: { fromStatus: previous.status, toStatus: status },
    });

    const rendered = renderTemplate({
      key: EmailTemplateKey.LeadStatusChanged,
      data: {
        leadName: `${entity.firstName} ${entity.lastName}`,
        previousStatus: previous.status,
        newStatus: status,
        portalUrl: `${this.staffPortalUrl}/${entity.id}`,
      },
    });
    await this.crmEmail.sendToAddress(entity.email, rendered, {
      idempotencyKey: `lead-status-${id}-${status}-${entity.version}`,
    });

    return toDomainLead(entity);
  }

  async assignTo(
    context: AuthorizationContext,
    id: string,
    assigneeUserId: string,
    reason?: string | null,
  ): Promise<Lead> {
    const entity = await this.dataLayer.leadRepository.assignTo(
      context,
      id,
      assigneeUserId,
    );

    await this.dataLayer.leadAssignmentRepository.create(context, {
      leadId: id,
      assignedToUserId: assigneeUserId,
      reason: reason ?? null,
    });

    await this.dataLayer.leadActivityRepository.insert(context, {
      leadId: id,
      activityType: 'assignment',
      title: 'Lead assigned',
      description: reason ?? null,
      actorUserId: context.userId ?? null,
      metadata: { assignedToUserId: assigneeUserId },
    });

    return toDomainLead(entity);
  }

  async handleContactRequestCreated(input: {
    readonly contactRequestId: string;
    readonly email: string;
    readonly serviceInterest: string;
    readonly organizationId: string | null;
  }): Promise<void> {
    const organizationId = input.organizationId ?? this.platformOrganizationId;
    const context = createSystemContext(
      { requestId: `outbox-${input.contactRequestId}` },
      'contact request outbox processing',
    );

    const contact = await this.dataLayer.contactRequestStore.get(
      input.contactRequestId,
    );
    if (contact === null) {
      throw AppError.notFound(
        `ContactRequest ${input.contactRequestId} not found for outbox processing`,
      );
    }

    const existing = await this.dataLayer.leadStore.findByContactRequestId(
      input.contactRequestId,
    );
    if (existing !== null) {
      return;
    }

    const leadInput: CreateLeadFromContactInput = {
      contactRequestId: asEntityId(input.contactRequestId),
      organizationId: asOrganizationId(organizationId),
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      serviceInterest: contact.serviceInterest,
      message: contact.message,
      source: 'website',
    };

    const entity = await this.dataLayer.leadRepository.createFromContactSystem(
      context,
      leadInput,
    );

    await this.dataLayer.leadActivityRepository.insertForOrganization({
      leadId: entity.id,
      organizationId: entity.organizationId,
      activityType: 'lead_created',
      title: 'Lead created from website enquiry',
      description: null,
      actorUserId: null,
      metadata: { contactRequestId: input.contactRequestId },
    });

    await this.dataLayer.leadStatusHistoryRepository.recordForOrganization({
      leadId: entity.id,
      organizationId: entity.organizationId,
      fromStatus: null,
      toStatus: 'new',
      changedByUserId: null,
      reason: 'Created from public enquiry',
    });

    const publicEmail = renderTemplate({
      key: EmailTemplateKey.PublicEnquiryReceived,
      data: {
        recipientName: entity.firstName,
        serviceInterest: entity.serviceInterest,
      },
    });
    await this.crmEmail.sendToAddress(entity.email, publicEmail, {
      idempotencyKey: `enquiry-received-${entity.id}`,
    });

    const internalEmail = renderTemplate({
      key: EmailTemplateKey.InternalNewEnquiry,
      data: {
        contactName: `${entity.firstName} ${entity.lastName}`,
        email: entity.email,
        serviceInterest: entity.serviceInterest,
        message: entity.message ?? contact.message,
        portalUrl: `${this.staffPortalUrl}/${entity.id}`,
      },
    });
    await this.crmEmail.sendToSupport(internalEmail, {
      idempotencyKey: `internal-enquiry-${entity.id}`,
    });

    await this.dataLayer.leadActivityRepository.insertForOrganization({
      leadId: entity.id,
      organizationId: entity.organizationId,
      activityType: 'email_sent',
      title: 'Enquiry confirmation email sent',
      description: null,
      actorUserId: null,
      metadata: { template: EmailTemplateKey.PublicEnquiryReceived },
    });

    await this.dataLayer.contactRequestRepository.transitionStatusSystem(
      context,
      input.contactRequestId,
      'converted',
    );
  }
}
