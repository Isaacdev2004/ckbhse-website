import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditSubPageProps {
  auditId: string;
}

export default function AuditFindingsPage({ auditId }: AuditSubPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId, 'findings'],
    queryFn: () =>
      auditFetch<{ items: { title: string; severity: string; status: string }[] }>(
        `/${auditId}/findings`,
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Findings</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Non-conformances</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground">
                {item.severity} · {item.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
