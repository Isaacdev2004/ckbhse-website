import { useQuery } from '@tanstack/react-query';
import { InspectionLayout } from '@/components/inspection-layout';
import { inspectionFetch } from '@/lib/inspection-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

function InspectionSubPage({
  inspectionId,
  section,
}: {
  inspectionId: string;
  section: 'checklist' | 'findings' | 'evidence';
}) {
  const { data, isError, error } = useQuery({
    queryKey: ['inspections', inspectionId, section],
    queryFn: () =>
      inspectionFetch<{ items: Record<string, unknown>[] }>(`/${inspectionId}/${section}`),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold capitalize">{section}</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="space-y-2 pt-6">
          {(data?.items ?? []).map((item, i) => (
            <div key={String(item.id ?? i)} className="rounded border p-3 text-sm">
              {String(item.title ?? item.prompt ?? item.fileName ?? item.responseValue ?? 'Item')}
            </div>
          ))}
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}

export function InspectionChecklistPage({ inspectionId }: { inspectionId: string }) {
  return <InspectionSubPage inspectionId={inspectionId} section="checklist" />;
}

export function InspectionFindingsPage({ inspectionId }: { inspectionId: string }) {
  return <InspectionSubPage inspectionId={inspectionId} section="findings" />;
}

export function InspectionEvidencePage({ inspectionId }: { inspectionId: string }) {
  return <InspectionSubPage inspectionId={inspectionId} section="evidence" />;
}

export default function InspectionCalendarPage() {
  const { data, isError, error } = useQuery({
    queryKey: ['inspections', 'calendar'],
    queryFn: () =>
      inspectionFetch<{ items: { title: string; start: string | null }[] }>('/calendar'),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">Inspection Calendar</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardHeader><CardTitle className="text-base">Scheduled</CardTitle></CardHeader>
        <CardContent className="space-y-2">
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
