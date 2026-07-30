import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  useListLeads,
  type LeadStatus,
  type LeadPriority,
} from '@workspace/api-client-react';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
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

const PRIORITIES: LeadPriority[] = ['low', 'normal', 'high', 'urgent'];

const PAGE_SIZE = 25;

export default function LeadsPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<LeadStatus | 'all'>('all');
  const [priority, setPriority] = useState<LeadPriority | 'all'>('all');
  const [offset, setOffset] = useState(0);

  const params = useMemo(
    () => ({
      ...(keyword.trim() ? { q: keyword.trim() } : {}),
      ...(status !== 'all' ? { status } : {}),
      ...(priority !== 'all' ? { priority } : {}),
      offset,
      limit: PAGE_SIZE,
    }),
    [keyword, status, priority, offset],
  );

  const { data, isLoading, isError, error, refetch } = useListLeads(params);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Lead inbox
            </h1>
            <p className="text-sm text-muted-foreground">
              Search, filter, and manage enquiries converted to CRM leads.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search name, email, company…"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setOffset(0);
            }}
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as LeadStatus | 'all');
              setOffset(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value as LeadPriority | 'all');
              setOffset(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load leads'}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Service</TableHead>
                <TableHead className="text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {!isLoading && data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No leads match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
              {!isLoading
                ? data?.items.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {formatLeadName(lead.firstName, lead.lastName)}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {lead.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead.company ?? '—'}
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <LeadPriorityBadge priority={lead.priority} />
                      </TableCell>
                      <TableCell className="hidden max-w-[12rem] truncate lg:table-cell">
                        {lead.serviceInterest}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {data ? `${data.total} lead(s)` : '—'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() =>
                setOffset((value) => Math.max(0, value - PAGE_SIZE))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.hasMore}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
