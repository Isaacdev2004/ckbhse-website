import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { RiskLayout } from '@/components/risk-layout';
import { riskFetch } from '@/lib/risk-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function RiskAssessmentDetailPage({ assessmentId }: { assessmentId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['risk', assessmentId],
    queryFn: () =>
      riskFetch<{
        record: Record<string, unknown>;
        hazards: unknown[];
        treatments: unknown[];
        reviews: unknown[];
        bowtie: unknown[];
      }>(`/${assessmentId}`),
  });
  const record = data?.record;

  return (
    <RiskLayout>
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {String(record?.assessmentNumber ?? record?.title ?? 'Risk Assessment')}
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/risk-assessments/${assessmentId}/bowtie`}>Bow-Tie</Link>
        </Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Risk Scores</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Inherent: {String(record?.inherentRating ?? '—')} ({String(record?.inherentScore ?? '—')})</div>
          <div>Residual: {String(record?.residualRating ?? '—')} ({String(record?.residualScore ?? '—')})</div>
          <div>Status: {String(record?.status ?? '—')}</div>
          <div>Site: {String(record?.site ?? '—')}</div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Hazards', data?.hazards?.length ?? 0],
          ['Treatments', data?.treatments?.length ?? 0],
          ['Reviews', data?.reviews?.length ?? 0],
          ['Bow-Tie Elements', data?.bowtie?.length ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value)}</CardContent>
          </Card>
        ))}
      </div>
    </RiskLayout>
  );
}
