import { ComplianceAnalyticsLayout } from '@/components/compliance-analytics-layout';
import { useComplianceAnalyticsExecutive } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function ComplianceAnalyticsExecutivePage() {
  const { data, isError, error } = useComplianceAnalyticsExecutive();

  const trendLabel =
    data?.trendDirection === 'up'
      ? '↑'
      : data?.trendDirection === 'down'
        ? '↓'
        : '→';

  const widgets = data?.widgets as Record<string, number> | undefined;
  const monthlyCompliance = (
    data?.trends as { monthlyCompliance?: { month: string; score: number }[] } | undefined
  )?.monthlyCompliance;

  return (
    <ComplianceAnalyticsLayout>
      <h1 className="text-2xl font-semibold">Compliance Analytics</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Compliance Score</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {String(data?.complianceScore ?? '—')}%
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {trendLabel} {data?.trendDelta ?? 0}
            </span>
          </CardContent>
        </Card>
        {[
          ['Audit Completion', widgets?.auditCompletion],
          ['Inspection Completion', widgets?.inspectionCompletion],
          ['CAPA Completion', widgets?.capaCompletion],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}%</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Control Effectiveness', widgets?.controlEffectiveness],
          ['Open Findings', widgets?.openFindings],
          ['Open Alerts', widgets?.openAlerts],
          ['Critical Alerts', widgets?.criticalAlerts],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Monthly Compliance Trend</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(monthlyCompliance ?? []).map((row) => (
            <div key={row.month} className="flex justify-between rounded-md border p-2">
              <span>{row.month}</span>
              <span className="font-medium">{row.score}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </ComplianceAnalyticsLayout>
  );
}
