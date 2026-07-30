import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzlePortalStore } from '../stores/drizzle-portal.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  requirePermission(context, PERMISSIONS.PORTAL_ACCESS);
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

export class PortalRepository {
  constructor(private readonly store: DrizzlePortalStore) {}

  getOrganization(context: AuthorizationContext) {
    const organizationId = requireOrganizationId(context);
    return this.store.getOrganizationWithProfile(organizationId);
  }

  updateOrganizationProfile(
    context: AuthorizationContext,
    patch: Parameters<DrizzlePortalStore['updateOrganizationProfile']>[1],
  ) {
    requirePermission(context, PERMISSIONS.CLIENT_USER_MANAGE);
    const organizationId = requireOrganizationId(context);
    return this.store.updateOrganizationProfile(organizationId, patch);
  }

  listMembers(context: AuthorizationContext, keyword?: string) {
    requirePermission(context, PERMISSIONS.USER_READ);
    return this.store.listMembers(requireOrganizationId(context), keyword);
  }

  getSettings(context: AuthorizationContext) {
    return this.store.getSettings(requireOrganizationId(context));
  }

  updateSettings(
    context: AuthorizationContext,
    patch: Parameters<DrizzlePortalStore['updateSettings']>[1],
  ) {
    requirePermission(context, PERMISSIONS.CLIENT_USER_MANAGE);
    return this.store.updateSettings(requireOrganizationId(context), patch);
  }

  listProjects(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.PROJECT_READ);
    return this.store.listProjects(requireOrganizationId(context), status);
  }

  getProject(context: AuthorizationContext, projectId: string) {
    requirePermission(context, PERMISSIONS.PROJECT_READ);
    return this.store.getProject(requireOrganizationId(context), projectId);
  }

  listProjectTasks(context: AuthorizationContext, projectId: string) {
    requirePermission(context, PERMISSIONS.PROJECT_READ);
    return this.store.listProjectTasks(projectId);
  }

  listProjectComments(context: AuthorizationContext, projectId: string) {
    requirePermission(context, PERMISSIONS.PROJECT_READ);
    return this.store.listProjectComments(projectId);
  }

  listDocuments(context: AuthorizationContext, keyword?: string) {
    requirePermission(context, PERMISSIONS.DOCUMENT_READ);
    return this.store.listDocuments(requireOrganizationId(context), keyword);
  }

  getDocument(context: AuthorizationContext, documentId: string) {
    requirePermission(context, PERMISSIONS.DOCUMENT_READ);
    return this.store.getDocument(requireOrganizationId(context), documentId);
  }

  createDocument(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzlePortalStore['createDocument']>[0],
      'organizationId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.DOCUMENT_MANAGE);
    return this.store.createDocument({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  listCertificates(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CERTIFICATE_READ);
    return this.store.listCertificates(requireOrganizationId(context));
  }

  listActions(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.PORTAL_ACCESS);
    return this.store.listActions(requireOrganizationId(context), status);
  }

  listIncidents(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INCIDENT_READ);
    return this.store.listIncidents(requireOrganizationId(context));
  }

  listAudits(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listAudits(requireOrganizationId(context));
  }

  listComplianceTasks(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listComplianceTasks(requireOrganizationId(context));
  }

  listSupportTickets(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.TICKET_MANAGE);
    return this.store.listSupportTickets(
      requireOrganizationId(context),
      status,
    );
  }

  getSupportTicket(context: AuthorizationContext, ticketId: string) {
    requirePermission(context, PERMISSIONS.TICKET_MANAGE);
    return this.store.getSupportTicket(
      requireOrganizationId(context),
      ticketId,
    );
  }

  createSupportTicket(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzlePortalStore['createSupportTicket']>[0],
      'organizationId' | 'requesterUserId'
    >,
  ) {
    requirePermission(context, PERMISSIONS.TICKET_MANAGE);
    if (context.userId === undefined) {
      throw AppError.unauthorized();
    }
    return this.store.createSupportTicket({
      ...input,
      organizationId: requireOrganizationId(context),
      requesterUserId: context.userId,
    });
  }

  listTicketMessages(context: AuthorizationContext, ticketId: string) {
    requirePermission(context, PERMISSIONS.TICKET_MANAGE);
    return this.store.listTicketMessages(ticketId);
  }

  addTicketMessage(
    context: AuthorizationContext,
    ticketId: string,
    body: string,
  ) {
    requirePermission(context, PERMISSIONS.TICKET_MANAGE);
    if (context.userId === undefined) {
      throw AppError.unauthorized();
    }
    return this.store.addTicketMessage({
      ticketId,
      organizationId: requireOrganizationId(context),
      authorUserId: context.userId,
      body,
      isStaff: false,
    });
  }

  listMessageThreads(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.PORTAL_ACCESS);
    return this.store.listMessageThreads(requireOrganizationId(context));
  }

  listThreadMessages(context: AuthorizationContext, threadId: string) {
    requirePermission(context, PERMISSIONS.PORTAL_ACCESS);
    return this.store.listThreadMessages(
      threadId,
      requireOrganizationId(context),
    );
  }

  listActivities(context: AuthorizationContext, limit?: number) {
    requirePermission(context, PERMISSIONS.PORTAL_ACCESS);
    return this.store.listActivities(requireOrganizationId(context), limit);
  }

  recordActivity(
    context: AuthorizationContext,
    input: Omit<
      Parameters<DrizzlePortalStore['recordActivity']>[0],
      'organizationId' | 'actorUserId'
    >,
  ) {
    return this.store.recordActivity({
      ...input,
      organizationId: requireOrganizationId(context),
      actorUserId: context.userId ?? null,
    });
  }

  dashboardCounts(context: AuthorizationContext) {
    const organizationId = requireOrganizationId(context);
    return Promise.all([
      this.store.countOpenActions(organizationId),
      this.store.countExpiringCertificates(organizationId, 90),
      this.store.countOpenTickets(organizationId),
    ]).then(([openActions, expiringCertificates, openSupportTickets]) => ({
      openActions,
      expiringCertificates,
      openSupportTickets,
    }));
  }
}
