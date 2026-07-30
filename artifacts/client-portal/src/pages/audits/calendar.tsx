import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AuditCalendarPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'audits', 'calendar'],
    queryFn: () =>
      portalFetch<{ items: { title: string; start: string | null; status: string }[] }>(
        '/audits/calendar',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Calendar</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3 text-sm">
              <div className="font-medium">{item.title}</div>
              <div className="text-muted-foreground">
                {item.start ? new Date(item.start).toLocaleString() : 'TBC'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
