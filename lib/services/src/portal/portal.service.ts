import type { PortalRepository } from '@workspace/data/repositories/portal';
import type { AuthorizationContext } from '@workspace/platform/authorization';

export interface PortalDashboardData {
  readonly organizationName: string;
  readonly complianceScore: number | null;
  readonly healthScore: number | null;
  readonly openActions: number;
  readonly expiringCertificates: number;
  readonly openSupportTickets: number;
  readonly upcomingAudits: readonly {
    readonly id: string;
    readonly title: string;
    readonly scheduledAt: string;
    readonly status: string;
  }[];
  readonly recentDocuments: readonly {
    readonly id: string;
    readonly name: string;
    readonly category: string | null;
    readonly updatedAt: string;
  }[];
  readonly recentActivities: readonly {
    readonly id: string;
    readonly kind: string;
    readonly summary: string;
    readonly occurredAt: string;
  }[];
  readonly activeProjects: readonly {
    readonly id: string;
    readonly name: string;
    readonly status: string;
    readonly progressPercent: number;
  }[];
}

export class PortalService {
  constructor(private readonly portal: PortalRepository) {}

  async getDashboard(context: AuthorizationContext): Promise<PortalDashboardData> {
    const [org, counts, audits, documents, activities, projects] =
      await Promise.all([
        this.portal.getOrganization(context),
        this.portal.dashboardCounts(context),
        this.portal.listAudits(context),
        this.portal.listDocuments(context),
        this.portal.listActivities(context, 10),
        this.portal.listProjects(context, 'active'),
      ]);

    if (org === null) {
      throw new Error('Organization not found');
    }

    const upcomingAudits = audits
      .filter((audit) => audit.status === 'scheduled')
      .slice(0, 5)
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        scheduledAt: audit.scheduledAt.toISOString(),
        status: audit.status,
      }));

    return {
      organizationName: org.name,
      complianceScore: org.profile?.complianceScore ?? null,
      healthScore: org.profile?.healthScore ?? null,
      openActions: counts.openActions,
      expiringCertificates: counts.expiringCertificates,
      openSupportTickets: counts.openSupportTickets,
      upcomingAudits,
      recentDocuments: documents.slice(0, 5).map((doc) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        updatedAt: doc.updatedAt.toISOString(),
      })),
      recentActivities: activities.map((activity) => ({
        id: activity.id,
        kind: activity.kind,
        summary: activity.summary,
        occurredAt: activity.occurredAt.toISOString(),
      })),
      activeProjects: projects.slice(0, 5).map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        progressPercent: project.progressPercent,
      })),
    };
  }

  getOrganization(context: AuthorizationContext) {
    return this.portal.getOrganization(context);
  }

  updateOrganizationProfile(
    context: AuthorizationContext,
    patch: Parameters<PortalRepository['updateOrganizationProfile']>[1],
  ) {
    return this.portal.updateOrganizationProfile(context, patch);
  }

  listMembers(context: AuthorizationContext, keyword?: string) {
    return this.portal.listMembers(context, keyword);
  }

  getSettings(context: AuthorizationContext) {
    return this.portal.getSettings(context);
  }

  updateSettings(
    context: AuthorizationContext,
    patch: Parameters<PortalRepository['updateSettings']>[1],
  ) {
    return this.portal.updateSettings(context, patch);
  }

  listProjects(context: AuthorizationContext, status?: string) {
    return this.portal.listProjects(context, status);
  }

  getProject(context: AuthorizationContext, projectId: string) {
    return this.portal.getProject(context, projectId);
  }

  getProjectDetail(context: AuthorizationContext, projectId: string) {
    return Promise.all([
      this.portal.getProject(context, projectId),
      this.portal.listProjectTasks(context, projectId),
      this.portal.listProjectComments(context, projectId),
    ]).then(([project, tasks, comments]) => ({ project, tasks, comments }));
  }

  listDocuments(context: AuthorizationContext, keyword?: string) {
    return this.portal.listDocuments(context, keyword);
  }

  getDocument(context: AuthorizationContext, documentId: string) {
    return this.portal.getDocument(context, documentId);
  }

  createDocument(
    context: AuthorizationContext,
    input: Parameters<PortalRepository['createDocument']>[1],
  ) {
    return this.portal.createDocument(context, input);
  }

  listCertificates(context: AuthorizationContext) {
    return this.portal.listCertificates(context);
  }

  listActions(context: AuthorizationContext, status?: string) {
    return this.portal.listActions(context, status);
  }

  listIncidents(context: AuthorizationContext) {
    return this.portal.listIncidents(context);
  }

  listAudits(context: AuthorizationContext) {
    return this.portal.listAudits(context);
  }

  listComplianceTasks(context: AuthorizationContext) {
    return this.portal.listComplianceTasks(context);
  }

  listSupportTickets(context: AuthorizationContext, status?: string) {
    return this.portal.listSupportTickets(context, status);
  }

  getSupportTicket(context: AuthorizationContext, ticketId: string) {
    return this.portal.getSupportTicket(context, ticketId);
  }

  createSupportTicket(
    context: AuthorizationContext,
    input: Parameters<PortalRepository['createSupportTicket']>[1],
  ) {
    return this.portal.createSupportTicket(context, input);
  }

  listTicketMessages(context: AuthorizationContext, ticketId: string) {
    return this.portal.listTicketMessages(context, ticketId);
  }

  addTicketMessage(
    context: AuthorizationContext,
    ticketId: string,
    body: string,
  ) {
    return this.portal.addTicketMessage(context, ticketId, body);
  }

  listMessageThreads(context: AuthorizationContext) {
    return this.portal.listMessageThreads(context);
  }

  listThreadMessages(context: AuthorizationContext, threadId: string) {
    return this.portal.listThreadMessages(context, threadId);
  }

  listActivities(context: AuthorizationContext, limit?: number) {
    return this.portal.listActivities(context, limit);
  }

  async globalSearch(context: AuthorizationContext, query: string) {
    const keyword = query.trim();
    const [projects, documents, actions, audits, tickets] = await Promise.all([
      this.portal.listProjects(context),
      this.portal.listDocuments(context, keyword),
      this.portal.listActions(context),
      this.portal.listAudits(context),
      this.portal.listSupportTickets(context),
    ]);

    const lower = keyword.toLowerCase();
    return {
      projects: projects.filter((p) =>
        p.name.toLowerCase().includes(lower),
      ),
      documents,
      actions: actions.filter((a) =>
        a.title.toLowerCase().includes(lower),
      ),
      audits: audits.filter((a) =>
        a.title.toLowerCase().includes(lower),
      ),
      tickets: tickets.filter((t) =>
        t.subject.toLowerCase().includes(lower),
      ),
    };
  }
}
