import { Link } from 'wouter';
import { RiskLayout } from '@/components/risk-layout';
import { useRiskAssessmentDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

type DashboardPayload = {
  statistics?: Record<string, number>;
  kpis?: Record<string, number>;
};

export default function RiskDashboardPage() {
  const { data, isError, error } = useRiskAssessmentDashboard();
  const payload = data as DashboardPayload | undefined;
  const statistics = payload?.statistics;
  const kpis = payload?.kpis;

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Risk Dashboard</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total Assessments', statistics?.total],
          ['Active', statistics?.active],
          ['High/Critical', statistics?.highCritical],
          ['Hazards', statistics?.hazards],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Avg Residual Score', kpis?.averageResidualScore],
          ['Risk Reduction Rate', `${kpis?.reductionRate ?? '—'}%`],
          ['Review Compliance', `${kpis?.reviewCompliance ?? '—'}%`],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Button asChild><Link href="/risk-assessments/heatmap">View heat map</Link></Button>
    </RiskLayout>
  );
}
