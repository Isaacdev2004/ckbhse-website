import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AuditTemplatesPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', 'templates'],
    queryFn: () =>
      auditFetch<{ items: { id: string; name: string; version: number }[] }>(
        '/templates',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Templates</h1>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="rounded border p-3">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">Version {item.version}</div>
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates configured.</p>
          ) : null}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
