import { useQuery } from '@tanstack/react-query';
import { RiskLayout } from '@/components/risk-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function RiskAssessmentDetailPage({ assessmentId }: { assessmentId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'risk-assessments', assessmentId],
    queryFn: () =>
      portalFetch<{
        record: {
          assessmentNumber: string;
          title: string;
          status: string;
          inherentRating: string | null;
          residualRating: string | null;
          inherentScore: number | null;
          residualScore: number | null;
        };
        hazards: { title: string; residualRating: string | null }[];
      }>(`/risk-assessments/${assessmentId}`),
  });
  const record = data?.record;

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">{record?.assessmentNumber ?? 'Risk Assessment'}</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">{record?.title ?? 'Details'}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <div>Status: {record?.status ?? '—'}</div>
          <div>Inherent: {record?.inherentRating ?? '—'} ({record?.inherentScore ?? '—'})</div>
          <div>Residual: {record?.residualRating ?? '—'} ({record?.residualScore ?? '—'})</div>
        </CardContent>
      </Card>
      {(data?.hazards?.length ?? 0) > 0 ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Linked Hazards</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data?.hazards.map((hazard, index) => (
              <div key={index} className="rounded border p-2 text-sm">
                {hazard.title} — {hazard.residualRating ?? 'unrated'}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </RiskLayout>
  );
}
