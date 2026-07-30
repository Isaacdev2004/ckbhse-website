import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function AuditDashboardPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', 'dashboard'],
    queryFn: () =>
      auditFetch<{
        statistics?: Record<string, number>;
        kpis?: Record<string, number>;
        upcoming?: { id: string; name: string; plannedStart: string | null }[];
      }>('/dashboard'),
  });

  const stats = data?.statistics ?? {};
  const kpis = data?.kpis ?? {};

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Dashboard</h1>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', stats.total],
          ['Scheduled', stats.scheduled],
          ['In Progress', stats.inProgress],
          ['Closed', stats.closed],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Compliance %', kpis.compliancePercent],
          ['Avg Score', kpis.averageAuditScore],
          ['Open Findings', kpis.openFindings],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Audits</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.upcoming ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.plannedStart ? new Date(item.plannedStart).toLocaleDateString() : 'TBC'}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/audits/${item.id}`}>Open</Link>
              </Button>
            </div>
          ))}
          {(data?.upcoming ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming audits.</p>
          ) : null}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
