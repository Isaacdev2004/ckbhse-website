import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { RiskLayout } from '@/components/risk-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function RiskAssessmentsPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'risk-assessments'],
    queryFn: () =>
      portalFetch<{ items: { id: string; assessmentNumber: string; title: string; status: string; residualRating: string | null }[] }>(
        '/risk-assessments',
      ),
  });

  return (
    <RiskLayout>
      <h1 className="text-2xl font-semibold">Risk Assessments</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{item.assessmentNumber}</div>
                <div className="text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">
                  {item.status} · Residual: {item.residualRating ?? '—'}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/risk-assessments/${item.id}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}
