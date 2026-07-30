import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AuditReportsPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'audits', 'reports'],
    queryFn: () =>
      portalFetch<{ items: { id: string; title: string; score: number | null }[] }>(
        '/audits/reports',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Reports</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Published Reports</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="rounded border p-3 text-sm">
              <div className="font-medium">{item.title}</div>
              <div className="text-muted-foreground">Score: {item.score ?? '—'}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
