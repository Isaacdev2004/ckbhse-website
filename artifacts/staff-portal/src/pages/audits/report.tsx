import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface AuditSubPageProps {
  auditId: string;
}

export default function AuditReportPage({ auditId }: AuditSubPageProps) {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', auditId, 'report'],
    queryFn: () =>
      auditFetch<{ title: string; reportType: string; summary: Record<string, unknown> }>(
        `/${auditId}/report?type=executive`,
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Report</h1>
      <p className="text-sm text-muted-foreground">
        PDF generation architecture placeholder — report metadata is persisted.
      </p>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      {data ? (
        <Card>
          <CardHeader><CardTitle className="text-base">{data.title}</CardTitle></CardHeader>
          <CardContent className="text-sm">
            Type: {data.reportType}
            <pre className="mt-2 rounded bg-muted p-3 text-xs">
              {JSON.stringify(data.summary, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </AuditLayout>
  );
}
