import type { DataLayer } from '@workspace/data';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { LeadPriority } from '@workspace/domain/crm';

export interface CreateReminderInput {
  readonly leadId: string;
  readonly title: string;
  readonly dueAt: Date;
  readonly priority?: LeadPriority;
  readonly assignedToUserId?: string | null;
  readonly isRecurring?: boolean;
  readonly recurrenceRule?: string | null;
}

export class ReminderService {
  constructor(private readonly dataLayer: DataLayer) {}

  async create(
    context: AuthorizationContext,
    input: CreateReminderInput,
  ): Promise<{ id: string }> {
    await this.dataLayer.leadRepository.findByIdOrFail(context, input.leadId);

    const reminder = await this.dataLayer.leadReminderRepository.create(
      context,
      {
        leadId: input.leadId,
        title: input.title.trim(),
        dueAt: input.dueAt,
        priority: input.priority ?? 'normal',
        assignedToUserId: input.assignedToUserId ?? context.userId ?? null,
        isRecurring: input.isRecurring ?? false,
        recurrenceRule: input.recurrenceRule ?? null,
      },
    );

    return { id: reminder.id };
  }

  async complete(
    context: AuthorizationContext,
    reminderId: string,
  ): Promise<void> {
    await this.dataLayer.leadReminderRepository.update(context, reminderId, {
      completedAt: new Date(),
    });
  }

  async listForLead(context: AuthorizationContext, leadId: string) {
    await this.dataLayer.leadRepository.findByIdOrFail(context, leadId);
    return this.dataLayer.leadReminderRepository.listByLeadId(context, leadId);
  }
}
