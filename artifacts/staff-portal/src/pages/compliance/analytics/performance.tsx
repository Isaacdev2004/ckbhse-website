import { ComplianceAnalyticsLayout } from '@/components/compliance-analytics-layout';
import { useComplianceAnalyticsPerformance } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function ComplianceAnalyticsPerformancePage() {
  const { data, isError, error } = useComplianceAnalyticsPerformance();

  const audits = data?.audits as Record<string, number> | undefined;
  const inspections = data?.inspections as Record<string, number> | undefined;
  const capa = data?.capa as Record<string, number> | undefined;
  const controls = data?.controls as Record<string, number> | undefined;

  return (
    <ComplianceAnalyticsLayout>
      <h1 className="text-2xl font-semibold">Performance Analytics</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-sm">Organisation Score</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{String(data?.complianceScore ?? '—')}%</CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            ['Audits', audits],
            ['Inspections', inspections],
            ['CAPA', capa],
          ] as const
        ).map(([label, stats]) => (
          <Card key={label}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              {Object.entries(stats ?? {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Control Effectiveness</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-3">
          {Object.entries(controls ?? {}).map(([key, value]) => (
            <div key={key} className="rounded-md border p-2">
              <div className="text-muted-foreground">{key}</div>
              <div className="text-lg font-semibold">{String(value)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </ComplianceAnalyticsLayout>
  );
}
