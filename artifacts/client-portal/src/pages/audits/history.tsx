import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AuditHistoryPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'audits', 'history'],
    queryFn: () =>
      portalFetch<{ items: { name: string; status: string; closedAt?: string }[] }>(
        '/audits/history',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit History</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Closed Audits</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3 text-sm">
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground">{item.status}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
