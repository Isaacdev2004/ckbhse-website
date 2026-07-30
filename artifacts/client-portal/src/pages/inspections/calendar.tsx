import { useQuery } from '@tanstack/react-query';
import { InspectionLayout } from '@/components/inspection-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent } from '@workspace/ui/components/card';

export default function InspectionCalendarPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'inspections', 'calendar'],
    queryFn: () => portalFetch<{ items: { title: string; start: string | null }[] }>('/inspections/calendar'),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">Inspection Calendar</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item, i) => (
            <div key={i} className="rounded border p-3 text-sm">
              {item.title} · {item.start ? new Date(item.start).toLocaleString() : 'TBC'}
            </div>
          ))}
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
