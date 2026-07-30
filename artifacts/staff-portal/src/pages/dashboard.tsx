import { Link } from 'wouter';
import { useGetDashboardMetrics } from '@workspace/api-client-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { StaffLayout } from '@/components/staff-layout';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetDashboardMetrics();

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              CRM dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Pipeline overview and response performance.
            </p>
          </div>
          <Button asChild>
            <Link href="/leads">Open lead inbox</Link>
          </Button>
        </div>

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            {(error as Error)?.message ?? 'Failed to load dashboard'}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))
            : data
              ? [
                  { label: 'New leads', value: data.newLeads },
                  { label: 'Qualified', value: data.qualified },
                  { label: 'Open pipeline', value: data.openLeads },
                  { label: 'Won', value: data.won },
                  { label: 'Lost', value: data.lost },
                  {
                    label: 'Avg response (min)',
                    value:
                      data.averageResponseMinutes !== null &&
                      data.averageResponseMinutes !== undefined
                        ? data.averageResponseMinutes
                        : '—',
                  },
                ].map((metric) => (
                  <Card key={metric.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold tabular-nums">
                        {metric.value}
                      </div>
                    </CardContent>
                  </Card>
                ))
              : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Charts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Chart widgets are reserved for a later milestone. Metric cards above
            are repository-backed and ready for visualization layers.
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
