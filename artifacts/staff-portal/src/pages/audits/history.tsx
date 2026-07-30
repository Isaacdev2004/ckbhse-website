import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditSubPageProps {
  auditId: string;
}

export default function AuditHistoryPage({ auditId }: AuditSubPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId, 'history'],
    queryFn: () =>
      auditFetch<{ items: { revisionNumber: number; changeReason: string | null }[] }>(
        `/${auditId}/history`,
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Revision History</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Revisions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3 text-sm">
              Revision {item.revisionNumber}: {item.changeReason ?? 'Updated'}
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No revisions recorded.</p>
          ) : null}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
