import type { DataLayer } from '@workspace/data';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';

export interface TimelineEntry {
  readonly id: string;
  readonly kind: 'activity' | 'status' | 'note';
  readonly title: string;
  readonly description: string | null;
  readonly occurredAt: Date;
  readonly actorUserId: string | null;
  readonly metadata: Readonly<Record<string, unknown>> | null;
}

export class TimelineService {
  constructor(private readonly dataLayer: DataLayer) {}

  async getLeadTimeline(
    context: AuthorizationContext,
    leadId: string,
  ): Promise<readonly TimelineEntry[]> {
    await this.dataLayer.leadRepository.findByIdOrFail(context, leadId);

    const [activities, statusHistory, notes] = await Promise.all([
      this.dataLayer.leadActivityRepository.listByLeadId(context, leadId),
      this.dataLayer.leadStatusHistoryRepository.listByLeadId(context, leadId),
      this.dataLayer.leadNoteRepository.listByLeadId(context, leadId),
    ]);

    const entries: TimelineEntry[] = [
      ...activities.map((activity) => ({
        id: activity.id,
        kind: 'activity' as const,
        title: activity.title,
        description: activity.description,
        occurredAt: activity.createdAt,
        actorUserId: activity.actorUserId,
        metadata: activity.metadata,
      })),
      ...statusHistory.map((entry) => ({
        id: entry.id,
        kind: 'status' as const,
        title: entry.fromStatus
          ? `Status: ${entry.fromStatus} → ${entry.toStatus}`
          : `Status set to ${entry.toStatus}`,
        description: entry.reason,
        occurredAt: entry.createdAt,
        actorUserId: entry.changedByUserId,
        metadata: null,
      })),
      ...notes.map((note) => ({
        id: note.id,
        kind: 'note' as const,
        title: note.isInternal ? 'Internal note' : 'Note',
        description: note.body,
        occurredAt: note.createdAt,
        actorUserId: note.authorUserId,
        metadata: { isInternal: note.isInternal },
      })),
    ];

    return entries.sort(
      (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime(),
    );
  }

  async addNote(
    context: AuthorizationContext,
    leadId: string,
    body: string,
    isInternal = true,
  ): Promise<TimelineEntry> {
    if (context.userId === undefined) {
      throw AppError.unauthorized();
    }

    await this.dataLayer.leadRepository.findByIdOrFail(context, leadId);

    const note = await this.dataLayer.leadNoteRepository.create(context, {
      leadId,
      body: body.trim(),
      isInternal,
      authorUserId: context.userId,
    });

    await this.dataLayer.leadActivityRepository.insert(context, {
      leadId,
      activityType: 'note_added',
      title: isInternal ? 'Internal note added' : 'Note added',
      description: null,
      actorUserId: context.userId,
      metadata: { noteId: note.id },
    });

    return {
      id: note.id,
      kind: 'note',
      title: isInternal ? 'Internal note' : 'Note',
      description: note.body,
      occurredAt: note.createdAt,
      actorUserId: note.authorUserId,
      metadata: { isInternal: note.isInternal },
    };
  }
}
