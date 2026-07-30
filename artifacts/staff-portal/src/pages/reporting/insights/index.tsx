import { ReportingLayout } from '@/components/reporting-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  useReportingGetTrendAnalysis,
  useReportingListForecasts,
  useReportingRefreshForecasts,
} from '@workspace/api-client-react';
import { useAuth } from '@/providers/auth-provider';
import { PERMISSIONS } from '@workspace/platform/permissions';

export default function ReportingInsightsPage() {
  const { session } = useAuth();
  const { data: forecasts, isError: forecastsError, error: forecastsErr } =
    useReportingListForecasts();
  const { data: trend, isError: trendError, error: trendErr } =
    useReportingGetTrendAnalysis('compliance.score');
  const refresh = useReportingRefreshForecasts();
  const canManage = session?.permissions.includes(PERMISSIONS.REPORT_MANAGE) === true;

  return (
    <ReportingLayout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Predictive Insights</h2>
          <p className="text-sm text-muted-foreground">
            Trend analysis, moving averages, and forecast stubs
          </p>
        </div>
        {canManage ? (
          <Button variant="outline" disabled={refresh.isPending} onClick={() => void refresh.mutateAsync()}>
            Refresh forecasts
          </Button>
        ) : null}
      </div>

      {forecastsError ? (
        <p className="text-sm text-destructive">{(forecastsErr as Error).message}</p>
      ) : null}
      {trendError ? (
        <p className="text-sm text-destructive">{(trendErr as Error).message}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance score trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {trend ? (
              <>
                <p>
                  Direction: {trend.trendDirection} · Seasonality: {trend.seasonalityFlag}
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  {trend.points.map((point) => (
                    <li key={point.snapshotPeriod}>
                      {point.snapshotPeriod}: {point.value}
                      {point.movingAverage !== null && point.movingAverage !== undefined
                        ? ` (MA: ${point.movingAverage})`
                        : ''}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">No trend data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Forecast stubs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(forecasts?.items ?? []).map((forecast) => (
              <div key={forecast.kpiKey} className="rounded-md border p-3">
                <p className="font-medium">{forecast.label}</p>
                <p className="text-muted-foreground">
                  {forecast.forecastPeriod}: {forecast.projectedValue} ({forecast.confidence}{' '}
                  confidence)
                </p>
                {forecast.riskOfBreach ? (
                  <p className="text-destructive">Risk of target breach flagged</p>
                ) : null}
              </div>
            ))}
            {(forecasts?.items ?? []).length === 0 ? (
              <p className="text-muted-foreground">No forecasts generated yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ReportingLayout>
  );
}
