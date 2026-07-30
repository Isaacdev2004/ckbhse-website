import type { LeadStatus, LeadPriority } from '@workspace/api-client-react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/utils';

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  qualified: 'Qualified',
  proposal_sent: 'Proposal sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
};

const statusVariant: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-800',
  acknowledged: 'bg-indigo-100 text-indigo-800',
  qualified: 'bg-violet-100 text-violet-800',
  proposal_sent: 'bg-amber-100 text-amber-900',
  negotiation: 'bg-orange-100 text-orange-900',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-rose-100 text-rose-800',
  archived: 'bg-slate-100 text-slate-700',
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium capitalize', statusVariant[status])}
    >
      {statusLabels[status]}
    </Badge>
  );
}

const priorityVariant: Record<LeadPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-slate-100 text-slate-800',
  high: 'bg-amber-100 text-amber-900',
  urgent: 'bg-red-100 text-red-800',
};

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn('capitalize', priorityVariant[priority])}
    >
      {priority}
    </Badge>
  );
}

export function formatLeadName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
