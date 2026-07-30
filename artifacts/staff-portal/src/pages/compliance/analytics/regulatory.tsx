import { useQueryClient } from '@tanstack/react-query';
import { ComplianceAnalyticsLayout } from '@/components/compliance-analytics-layout';
import {
  getComplianceAnalyticsRegulatoryQueryKey,
  useAcknowledgeComplianceAnalyticsAlert,
  useComplianceAnalyticsRegulatory,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function ComplianceAnalyticsRegulatoryPage() {
  const queryClient = useQueryClient();
  const { data, isError, error } = useComplianceAnalyticsRegulatory();

  const acknowledge = useAcknowledgeComplianceAnalyticsAlert({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getComplianceAnalyticsRegulatoryQueryKey(),
        });
      },
    },
  });

  const stats = data?.stats as Record<string, number> | undefined;
  const alerts = data?.alerts as {
    id: string;
    title: string;
    severity: string;
    status: string;
    alertType: string;
  }[] | undefined;

  return (
    <ComplianceAnalyticsLayout>
      <h1 className="text-2xl font-semibold">Regulatory Intelligence</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total Regulations', stats?.total],
          ['Compliant', stats?.compliant],
          ['Review Required', stats?.reviewRequired],
          ['Non-Compliant', stats?.nonCompliant],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Regulatory Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(alerts ?? []).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <div className="font-medium">{alert.title}</div>
                <div className="text-muted-foreground">
                  {alert.severity} · {alert.alertType} · {alert.status}
                </div>
              </div>
              {alert.status === 'open' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acknowledge.isPending}
                  onClick={() => acknowledge.mutate({ alertId: alert.id })}
                >
                  Acknowledge
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </ComplianceAnalyticsLayout>
  );
}
