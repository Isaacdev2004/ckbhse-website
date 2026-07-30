import { useQuery } from '@tanstack/react-query';
import { AuditLayout } from '@/components/audit-layout';
import { auditFetch } from '@/lib/audit-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

export default function AuditCalendarPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['audits', 'calendar'],
    queryFn: () =>
      auditFetch<{ items: { title: string; start: string | null; status: string }[] }>(
        '/calendar',
      ),
  });

  return (
    <AuditLayout>
      <h1 className="text-2xl font-semibold">Audit Calendar</h1>
      <p className="text-sm text-muted-foreground">
        Outlook integration placeholder — calendar events are organisation-scoped.
      </p>
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Scheduled Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.items ?? []).map((item, index) => (
            <div key={index} className="rounded border p-3">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground">
                {item.start ? new Date(item.start).toLocaleString() : 'TBC'} · {item.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuditLayout>
  );
}
