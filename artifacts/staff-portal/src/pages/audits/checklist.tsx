import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditSubPageProps {
  auditId: string;
}

export default function AuditChecklistPage({ auditId }: AuditSubPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId, 'checklist'],
    queryFn: () =>
      auditFetch<{ items: Record<string, unknown>[] }>(`/${auditId}/checklist`),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Checklist</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Responses</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={String(item.id ?? index)} className="rounded border p-3 text-sm">
              {String(item.responseValue ?? 'Pending')}
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklist responses yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
