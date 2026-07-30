import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { PortalLayout } from '@/components/portal-layout';
import {
  usePortalComplianceAnalyticsAlerts,
  usePortalComplianceAnalyticsExecutive,
} from '@workspace/api-client-react';

export default function ComplianceAnalyticsPage() {
  const executive = usePortalComplianceAnalyticsExecutive();
  const alerts = usePortalComplianceAnalyticsAlerts();

  const data = executive.data;
  const widgets = data?.widgets as Record<string, number> | undefined;
  const monthlyCompliance = (
    data?.trends as { monthlyCompliance?: { month: string; score: number }[] } | undefined
  )?.monthlyCompliance;

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Compliance Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Executive KPIs, trends, and regulatory alerts (read-only)
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/compliance">Back to workspace</Link>
          </Button>
        </div>
        {executive.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(executive.error as Error)?.message ?? 'Failed to load analytics'}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Compliance Score', data?.complianceScore],
            ['Audit Completion', widgets?.auditCompletion],
            ['Inspection Completion', widgets?.inspectionCompletion],
            ['CAPA Completion', widgets?.capaCompletion],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(monthlyCompliance ?? []).map((row) => (
              <div key={row.month} className="flex justify-between rounded-md border p-2">
                <span>{row.month}</span>
                <span>{row.score}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Open Regulatory Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(alerts.data?.items ?? []).map((alert) => (
              <div key={alert.id} className="rounded-md border p-3">
                {alert.title} · {alert.severity}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
