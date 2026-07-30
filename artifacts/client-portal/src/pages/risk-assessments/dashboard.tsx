import { RiskLayout } from '@/components/risk-layout';
import { usePortalRiskDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

type DashboardPayload = {
  statistics?: Record<string, number>;
};

export default function RiskDashboardPage() {
  const { data, isError, error } = usePortalRiskDashboard();
  const payload = data as DashboardPayload | undefined;
  const statistics = payload?.statistics;

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Risk Dashboard</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Active', statistics?.active],
          ['High/Critical', statistics?.highCritical],
          ['Hazards', statistics?.hazards],
          ['Open Treatments', statistics?.treatmentsOpen],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
    </RiskLayout>
  );
}
