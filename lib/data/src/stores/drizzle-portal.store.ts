import type { Database } from '@workspace/db';
import {
  complianceTasks,
  organizationActions,
  organizationActivities,
  organizationAudits,
  organizationCertificates,
  organizationDocuments,
  organizationIncidents,
  organizationMembers,
  organizationMessageThreads,
  organizationMessages,
  organizationProfiles,
  organizationProjects,
  organizationSettings,
  organizations,
  projectComments,
  projectTasks,
  supportTicketMessages,
  supportTickets,
  users,
} from '@workspace/db/schema';
import { and, asc, desc, eq, ilike, isNull, lte, or, sql } from 'drizzle-orm';

export class DrizzlePortalStore {
  constructor(private readonly db: Database) {}

  async getOrganizationWithProfile(organizationId: string) {
    const [row] = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        status: organizations.status,
        type: organizations.type,
        profile: organizationProfiles,
      })
      .from(organizations)
      .leftJoin(
        organizationProfiles,
        eq(organizations.id, organizationProfiles.organizationId),
      )
      .where(eq(organizations.id, organizationId))
      .limit(1);
    return row ?? null;
  }

  async updateOrganizationProfile(
    organizationId: string,
    patch: Partial<typeof organizationProfiles.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(organizationProfiles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(organizationProfiles.organizationId, organizationId))
      .returning();
    return row ?? null;
  }

  async listMembers(organizationId: string, keyword?: string) {
    const conditions = [
      eq(organizationMembers.organizationId, organizationId),
      isNull(organizationMembers.deletedAt),
    ];
    if (keyword !== undefined && keyword.length > 0) {
      conditions.push(
        or(
          ilike(users.email, `%${keyword}%`),
          ilike(users.firstName, `%${keyword}%`),
          ilike(users.lastName, `%${keyword}%`),
        )!,
      );
    }
    return this.db
      .select({
        member: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(and(...conditions))
      .orderBy(asc(users.lastName));
  }

  async getSettings(organizationId: string) {
    const [row] = await this.db
      .select()
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, organizationId))
      .limit(1);
    return row ?? null;
  }

  async updateSettings(
    organizationId: string,
    patch: Partial<typeof organizationSettings.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(organizationSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(organizationSettings.organizationId, organizationId))
      .returning();
    return row ?? null;
  }

  async listProjects(organizationId: string, status?: string) {
    const conditions = [
      eq(organizationProjects.organizationId, organizationId),
      isNull(organizationProjects.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(organizationProjects.status, status as never));
    }
    return this.db
      .select()
      .from(organizationProjects)
      .where(and(...conditions))
      .orderBy(desc(organizationProjects.updatedAt));
  }

  async getProject(organizationId: string, projectId: string) {
    const [row] = await this.db
      .select()
      .from(organizationProjects)
      .where(
        and(
          eq(organizationProjects.id, projectId),
          eq(organizationProjects.organizationId, organizationId),
          isNull(organizationProjects.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listProjectTasks(projectId: string) {
    return this.db
      .select()
      .from(projectTasks)
      .where(
        and(eq(projectTasks.projectId, projectId), isNull(projectTasks.deletedAt)),
      )
      .orderBy(asc(projectTasks.dueDate));
  }

  async listProjectComments(projectId: string) {
    return this.db
      .select()
      .from(projectComments)
      .where(
        and(
          eq(projectComments.projectId, projectId),
          isNull(projectComments.deletedAt),
        ),
      )
      .orderBy(desc(projectComments.createdAt));
  }

  async listDocuments(organizationId: string, keyword?: string) {
    const conditions = [
      eq(organizationDocuments.organizationId, organizationId),
      isNull(organizationDocuments.deletedAt),
    ];
    if (keyword !== undefined && keyword.length > 0) {
      conditions.push(ilike(organizationDocuments.name, `%${keyword}%`));
    }
    return this.db
      .select()
      .from(organizationDocuments)
      .where(and(...conditions))
      .orderBy(desc(organizationDocuments.updatedAt));
  }

  async getDocument(organizationId: string, documentId: string) {
    const [row] = await this.db
      .select()
      .from(organizationDocuments)
      .where(
        and(
          eq(organizationDocuments.id, documentId),
          eq(organizationDocuments.organizationId, organizationId),
          isNull(organizationDocuments.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createDocument(
    values: typeof organizationDocuments.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(organizationDocuments)
      .values(values)
      .returning();
    return row!;
  }

  async listCertificates(organizationId: string) {
    return this.db
      .select()
      .from(organizationCertificates)
      .where(
        and(
          eq(organizationCertificates.organizationId, organizationId),
          isNull(organizationCertificates.deletedAt),
        ),
      )
      .orderBy(asc(organizationCertificates.expiresAt));
  }

  async listActions(organizationId: string, status?: string) {
    const conditions = [
      eq(organizationActions.organizationId, organizationId),
      isNull(organizationActions.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(organizationActions.status, status as never));
    }
    return this.db
      .select()
      .from(organizationActions)
      .where(and(...conditions))
      .orderBy(asc(organizationActions.dueDate));
  }

  async listIncidents(organizationId: string) {
    return this.db
      .select()
      .from(organizationIncidents)
      .where(
        and(
          eq(organizationIncidents.organizationId, organizationId),
          isNull(organizationIncidents.deletedAt),
        ),
      )
      .orderBy(desc(organizationIncidents.reportedAt));
  }

  async listAudits(organizationId: string) {
    return this.db
      .select()
      .from(organizationAudits)
      .where(
        and(
          eq(organizationAudits.organizationId, organizationId),
          isNull(organizationAudits.deletedAt),
        ),
      )
      .orderBy(asc(organizationAudits.scheduledAt));
  }

  async listComplianceTasks(organizationId: string) {
    return this.db
      .select()
      .from(complianceTasks)
      .where(
        and(
          eq(complianceTasks.organizationId, organizationId),
          isNull(complianceTasks.deletedAt),
        ),
      )
      .orderBy(asc(complianceTasks.dueDate));
  }

  async listSupportTickets(organizationId: string, status?: string) {
    const conditions = [
      eq(supportTickets.organizationId, organizationId),
      isNull(supportTickets.deletedAt),
    ];
    if (status !== undefined) {
      conditions.push(eq(supportTickets.status, status as never));
    }
    return this.db
      .select()
      .from(supportTickets)
      .where(and(...conditions))
      .orderBy(desc(supportTickets.updatedAt));
  }

  async getSupportTicket(organizationId: string, ticketId: string) {
    const [row] = await this.db
      .select()
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.id, ticketId),
          eq(supportTickets.organizationId, organizationId),
          isNull(supportTickets.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createSupportTicket(
    values: typeof supportTickets.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(supportTickets)
      .values(values)
      .returning();
    return row!;
  }

  async listTicketMessages(ticketId: string) {
    return this.db
      .select()
      .from(supportTicketMessages)
      .where(
        and(
          eq(supportTicketMessages.ticketId, ticketId),
          isNull(supportTicketMessages.deletedAt),
        ),
      )
      .orderBy(asc(supportTicketMessages.createdAt));
  }

  async addTicketMessage(
    values: typeof supportTicketMessages.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(supportTicketMessages)
      .values(values)
      .returning();
    return row!;
  }

  async listMessageThreads(organizationId: string) {
    return this.db
      .select()
      .from(organizationMessageThreads)
      .where(
        and(
          eq(organizationMessageThreads.organizationId, organizationId),
          isNull(organizationMessageThreads.deletedAt),
        ),
      )
      .orderBy(desc(organizationMessageThreads.lastMessageAt));
  }

  async listThreadMessages(threadId: string, organizationId: string) {
    return this.db
      .select()
      .from(organizationMessages)
      .where(
        and(
          eq(organizationMessages.threadId, threadId),
          eq(organizationMessages.organizationId, organizationId),
          eq(organizationMessages.isInternal, false),
          isNull(organizationMessages.deletedAt),
        ),
      )
      .orderBy(asc(organizationMessages.createdAt));
  }

  async listActivities(organizationId: string, limit = 50) {
    return this.db
      .select()
      .from(organizationActivities)
      .where(
        and(
          eq(organizationActivities.organizationId, organizationId),
          isNull(organizationActivities.deletedAt),
        ),
      )
      .orderBy(desc(organizationActivities.occurredAt))
      .limit(limit);
  }

  async recordActivity(
    values: typeof organizationActivities.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(organizationActivities)
      .values(values)
      .returning();
    return row!;
  }

  async countExpiringCertificates(organizationId: string, withinDays: number) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + withinDays);
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationCertificates)
      .where(
        and(
          eq(organizationCertificates.organizationId, organizationId),
          isNull(organizationCertificates.deletedAt),
          lte(organizationCertificates.expiresAt, deadline),
        ),
      );
    return rows[0]?.count ?? 0;
  }

  async countOpenActions(organizationId: string) {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationActions)
      .where(
        and(
          eq(organizationActions.organizationId, organizationId),
          isNull(organizationActions.deletedAt),
          or(
            eq(organizationActions.status, 'open'),
            eq(organizationActions.status, 'in_progress'),
            eq(organizationActions.status, 'overdue'),
          ),
        ),
      );
    return rows[0]?.count ?? 0;
  }

  async countOpenTickets(organizationId: string) {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.organizationId, organizationId),
          isNull(supportTickets.deletedAt),
          or(
            eq(supportTickets.status, 'open'),
            eq(supportTickets.status, 'in_progress'),
            eq(supportTickets.status, 'awaiting_client'),
          ),
        ),
      );
    return rows[0]?.count ?? 0;
  }
}
