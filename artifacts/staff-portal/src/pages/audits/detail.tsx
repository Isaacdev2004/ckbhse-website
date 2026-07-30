import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface AuditDetailPageProps {
  auditId: string;
}

export default function AuditDetailPage({ auditId }: AuditDetailPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId],
    queryFn: () =>
      auditFetch<{ audit: Record<string, unknown>; findings: unknown[] }>(`/${auditId}`),
  });

  const audit = data?.audit;

  return (
    <AuditLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{String(audit?.name ?? 'Audit')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/checklist`}>Checklist</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/findings`}>Findings</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/evidence`}>Evidence</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/report`}>Report</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/audits/${auditId}/history`}>History</Link>
          </Button>
        </div>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
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
