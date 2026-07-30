import { Link } from 'wouter';
import { CapaLayout } from '@/components/capa-layout';
import { useCapaDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

type DashboardPayload = {
  statistics?: Record<string, number>;
  kpis?: Record<string, number>;
};

export default function CapaDashboardPage() {
  const { data, isError, error } = useCapaDashboard();
  const payload = data as DashboardPayload | undefined;
  const statistics = payload?.statistics;
  const kpis = payload?.kpis;

  return (
    <CapaLayout>
      <h1 className="text-2xl font-semibold">CAPA Dashboard</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', statistics?.total],
          ['Open', statistics?.open],
          ['In Progress', statistics?.inProgress],
          ['Closed', statistics?.closed],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Closure Rate', `${kpis?.closureRate ?? '—'}%`],
          ['Verification Pending', kpis?.verificationPending],
          ['Overdue', statistics?.overdue],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Button asChild><Link href="/capa">View all CAPA records</Link></Button>
    </CapaLayout>
  );
}
