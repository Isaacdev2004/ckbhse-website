import { useState } from 'react';
import { Link } from 'wouter';
import {
  useGetLead,
  useGetLeadTimeline,
  useListReminders,
  useUpdateLeadStatus,
  useAddLeadNote,
  type LeadStatus,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { StaffLayout } from '@/components/staff-layout';
import {
  formatDate,
  formatLeadName,
  LeadPriorityBadge,
  LeadStatusBadge,
} from '@/lib/lead-display';

const STATUSES: LeadStatus[] = [
  'new',
  'acknowledged',
  'qualified',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
  'archived',
];

export default function LeadDetailPage({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const [noteBody, setNoteBody] = useState('');

  const { data: lead, isLoading, isError, error } = useGetLead(leadId);
  const { data: timeline } = useGetLeadTimeline(leadId);
  const { data: reminders } = useListReminders({ leadId });

  const statusMutation = useUpdateLeadStatus({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['getLead', leadId] });
        await queryClient.invalidateQueries({
          queryKey: ['getLeadTimeline', leadId],
        });
        await queryClient.invalidateQueries({ queryKey: ['listLeads'] });
      },
    },
  });

  const noteMutation = useAddLeadNote({
    mutation: {
      onSuccess: async () => {
        setNoteBody('');
        await queryClient.invalidateQueries({
          queryKey: ['getLeadTimeline', leadId],
        });
      },
    },
  });

  if (isLoading) {
    return (
      <StaffLayout>
        <Skeleton className="h-64 w-full" />
      </StaffLayout>
    );
  }

  if (isError || !lead) {
    return (
      <StaffLayout>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          {(error as Error)?.message ?? 'Lead not found'}
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leads">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to inbox
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {formatLeadName(lead.firstName, lead.lastName)}
            </h1>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LeadStatusBadge status={lead.status} />
              <LeadPriorityBadge priority={lead.priority} />
            </div>
          </div>
          <Select
            value={lead.status}
            onValueChange={(value) =>
              statusMutation.mutate({
                id: leadId,
                data: { status: value as LeadStatus },
              })
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Phone" value={lead.phone ?? '—'} />
              <InfoRow label="Company" value={lead.company ?? '—'} />
              <InfoRow label="Service" value={lead.serviceInterest} />
              <InfoRow label="Industry" value={lead.industry ?? '—'} />
              <InfoRow label="Training" value={lead.trainingInterest ?? '—'} />
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Received" value={formatDate(lead.createdAt)} />
              {lead.contactRequestId ? (
                <InfoRow
                  label="Enquiry ID"
                  value={lead.contactRequestId.slice(0, 8) + '…'}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {lead.message ?? 'No message provided.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {timeline?.items.length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No activity yet.
                  </li>
                ) : null}
                {timeline?.items.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-l-2 border-primary/30 pl-4"
                  >
                    <div className="text-sm font-medium">{entry.title}</div>
                    {entry.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(entry.occurredAt)}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Internal note…"
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  rows={4}
                />
                <Button
                  size="sm"
                  disabled={
                    noteBody.trim().length === 0 || noteMutation.isPending
                  }
                  onClick={() =>
                    noteMutation.mutate({
                      id: leadId,
                      data: { body: noteBody.trim(), isInternal: true },
                    })
                  }
                >
                  Save note
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                {reminders?.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No reminders scheduled.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {reminders?.items.map((reminder) => (
                      <li
                        key={reminder.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span>{reminder.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reminder.dueAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}
