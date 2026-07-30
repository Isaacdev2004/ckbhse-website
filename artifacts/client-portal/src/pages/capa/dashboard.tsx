import { CapaLayout } from '@/components/capa-layout';
import { usePortalCapaDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

type DashboardPayload = {
  statistics?: Record<string, number>;
};

export default function CapaDashboardPage() {
  const { data, isError, error } = usePortalCapaDashboard();
  const payload = data as DashboardPayload | undefined;
  const statistics = payload?.statistics;

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">CAPA Dashboard</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Open', statistics?.open],
          ['In Progress', statistics?.inProgress],
          ['Pending Approval', statistics?.pendingApproval],
          ['Closed', statistics?.closed],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
    </CapaLayout>
  );
}
