import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function AuditsListPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', 'list'],
    queryFn: () => auditFetch<{ items: Record<string, unknown>[] }>('/'),
  });

  return (
    <AuditLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audits</h1>
        <Button asChild><Link href="/audits/new">New Audit</Link></Button>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">All Audits</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item) => (
            <div key={String(item.id)} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{String(item.name ?? '')}</div>
                <div className="text-xs text-muted-foreground">{String(item.status ?? '')}</div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/audits/${String(item.id)}`}>View</Link>
              </Button>
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No audits yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
