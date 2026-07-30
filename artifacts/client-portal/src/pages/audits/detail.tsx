import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditDetailPageProps {
  auditId: string;
}

export default function AuditDetailPage({ auditId }: AuditDetailPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'audits', auditId],
    queryFn: () =>
      portalFetch<{ audit: Record<string, unknown>; findings: unknown[] }>(
        `/audits/${auditId}`,
      ),
  });

  const audit = data?.audit;

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">{String(audit?.name ?? 'Audit')}</h1>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Status: {String(audit?.status ?? '—')}</div>
          <div>Site: {String(audit?.site ?? '—')}</div>
          <div>Score: {String(audit?.score ?? '—')}</div>
          <div>Findings: {data?.findings?.length ?? 0}</div>
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
