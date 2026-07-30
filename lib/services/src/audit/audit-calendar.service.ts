import type { AuditRepository } from '@workspace/data/repositories/audit';
import type { AuthorizationContext } from '@workspace/platform/authorization';

/** Calendar-oriented audit scheduling views (architecture placeholder for Outlook). */
export class AuditCalendarService {
  constructor(private readonly audit: AuditRepository) {}

  async listEvents(context: AuthorizationContext, withinDays = 90) {
    const rows = await this.audit.listUpcoming(context);
    return rows.map((row) => ({
      id: row.id,
      title: row.name,
      start: row.plannedStart?.toISOString() ?? null,
      end: row.plannedEnd?.toISOString() ?? null,
      status: row.status,
      site: row.site,
      allDay: false,
      outlookSyncPlaceholder: true,
    }));
  }
}
