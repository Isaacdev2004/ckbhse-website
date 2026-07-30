import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { InspectionLayout } from '@/components/inspection-layout';
import { inspectionFetch } from '@/lib/inspection-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

export default function InspectionDashboardPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['inspections', 'dashboard'],
    queryFn: () =>
      inspectionFetch<{
        statistics?: Record<string, number>;
        kpis?: Record<string, number>;
        today?: { id: string; name: string }[];
      }>('/dashboard'),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">Inspection Dashboard</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', data?.statistics?.total],
          ['Scheduled', data?.statistics?.scheduled],
          ['Passed', data?.statistics?.passed],
          ['Overdue', data?.statistics?.overdue],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? '—')}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Today&apos;s Inspections</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.today ?? []).map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <span>{item.name}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/inspections/${item.id}`}>Open</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
