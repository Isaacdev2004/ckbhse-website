import { useQuery } from '@tanstack/react-query';
import { InspectionLayout } from '@/components/inspection-layout';
import { portalFetch } from '@/lib/portal-api';
import { Card, CardContent } from '@workspace/ui/components/card';

export default function InspectionDetailPage({ inspectionId }: { inspectionId: string }) {
  const { data, isError, error } = useQuery({
    queryKey: ['portal', 'inspections', inspectionId],
    queryFn: () =>
      portalFetch<{ inspection: Record<string, unknown>; findings: unknown[] }>(
        `/inspections/${inspectionId}`,
      ),
  });

  return (
    <InspectionLayout>
      <h1 className="text-2xl font-semibold">{String(data?.inspection?.name ?? 'Inspection')}</h1>
      {isError ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
      <Card>
        <CardContent className="grid gap-2 pt-6 text-sm md:grid-cols-2">
          <div>Status: {String(data?.inspection?.status ?? '—')}</div>
          <div>Score: {String(data?.inspection?.score ?? '—')}</div>
          <div>Findings: {data?.findings?.length ?? 0}</div>
        </CardContent>
      </Card>
    </InspectionLayout>
  );
}
