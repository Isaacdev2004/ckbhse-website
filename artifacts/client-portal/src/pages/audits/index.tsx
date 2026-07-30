import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AuditLayout } from '@/components/audit-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function AuditsPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'audits'],
    queryFn: () =>
      portalFetch<{ items: { id: string; title: string; status: string }[] }>(
        '/audits',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audits</h1>
      <p className="text-sm text-muted-foreground">
        Audit schedule, reports, and corrective actions
      </p>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Your Audits</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.status}</div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/audits/${item.id}`}>View</Link>
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
