import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { RiskLayout } from '@/components/risk-layout';
import { riskFetch } from '@/lib/risk-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function RiskAssessmentsListPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['risk', 'list'],
    queryFn: () => riskFetch<{ items: Record<string, unknown>[] }>('/'),
  });

  return (
    <RiskLayout>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Risk Assessments</h1>
        <Button asChild><Link href="/risk-assessments/new">New</Link></Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item) => (
            <div key={String(item.id)} className="flex justify-between rounded border p-3">
              <div>
                <div className="font-medium">{String(item.assessmentNumber ?? item.title ?? '')}</div>
                <div className="text-xs text-muted-foreground">
                  {String(item.status ?? '')} · Residual: {String(item.residualRating ?? '—')}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/risk-assessments/${String(item.id)}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </RiskLayout>
  );
}
