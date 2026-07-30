import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditSubPageProps {
  auditId: string;
}

export default function AuditEvidencePage({ auditId }: AuditSubPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId, 'evidence'],
    queryFn: () =>
      auditFetch<{ items: { fileName: string | null; notes: string | null }[] }>(
        `/${auditId}/evidence`,
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Evidence</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Collected Evidence</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3 text-sm">
              {item.fileName ?? item.notes ?? 'Evidence item'}
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
