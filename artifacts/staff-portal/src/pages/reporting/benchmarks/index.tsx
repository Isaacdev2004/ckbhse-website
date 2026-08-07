import { ReportingLayout } from '@/components/reporting-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useReportingCompareBenchmarks } from '@workspace/api-client-react';

export default function ReportingBenchmarksPage() {
  const { data, isError, error } = useReportingCompareBenchmarks();

  return (
    <ReportingLayout>
      <div>
        <h2 className="text-xl font-semibold">Organization Benchmarks</h2>
        <p className="text-sm text-muted-foreground">
          Compare your KPIs against anonymised UK HSE mid-market cohorts
        </p>
      </div>

      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {data?.cohortKey ?? 'Benchmark cohort'} · {data?.snapshotPeriod ?? '—'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(data?.items ?? []).map((item) => (
            <div key={item.kpiKey} className="rounded-md border p-3">
              <p className="font-medium">{item.label}</p>
              <p>
                Your value: {item.organizationValue} · Cohort median: {item.cohortMedian}
              </p>
              <p className="text-muted-foreground">
                Percentile rank: {item.percentileRank} · Gap: {item.gapToMedian} · Band:{' '}
                {item.performanceBand}
              </p>
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-muted-foreground">No benchmark comparison available.</p>
          ) : null}
        </CardContent>
      </Card>
    </ReportingLayout>
  );
}
